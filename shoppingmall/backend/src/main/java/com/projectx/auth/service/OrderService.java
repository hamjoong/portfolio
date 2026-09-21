package com.projectx.auth.service;

import com.projectx.auth.domain.entity.*;
import com.projectx.auth.domain.repository.OrderRepository;
import com.projectx.auth.domain.repository.OutboxRepository;
import com.projectx.auth.domain.repository.ProductOptionRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.dto.OrderItemResponse;
import com.projectx.auth.dto.OrderResponse;
import com.projectx.auth.dto.PaymentRequest;
import com.projectx.auth.dto.ShippingInfoResponse;
import com.projectx.auth.exception.BusinessException;
import com.projectx.auth.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 주문 처리를 담당하는 서비스 클래스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final OutboxRepository outboxRepository;
    private final CartService cartService;
    private final ObjectMapper objectMapper;
    private final MockPaymentService paymentService;

    @Transactional
    public UUID createOrder(UUID userId, UUID productId, UUID optionId, Integer quantity, 
                            String receiverName, String phone, String address, String detailAddress) {
        Map<String, OrderItemRequest> itemsToOrder = resolveItemsToOrder(userId, productId, optionId, quantity);
        
        Order order = initializeOrder(userId, receiverName, phone, address, detailAddress);
        processOrderItems(order, itemsToOrder);
        
        boolean isVerified = paymentService.verifyPayment(PaymentRequest.builder()
                .orderId(order.getId())
                .amount(order.getTotalAmount())
                .idempotencyKey(order.getOrderNo())
                .build());
        
        if (!isVerified) {
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
        }
        
        finalizeOrder(order, userId, productId == null);

        saveOutboxEvent(order, userId, order.getTotalAmount());

        log.info("[Order] Created order {} (No: {}) for user {}", order.getId(), order.getOrderNo(), userId);
        return order.getId();
    }

    @Transactional
    public void cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PAID) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS);
        }

        boolean isRefunded = paymentService.refundPayment(orderId);
        if (!isRefunded) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        for (OrderItem item : order.getOrderItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
            product.addStock(item.getQuantity());
            productRepository.save(product);
        }

        order.cancel();
        log.info("[Order] Cancelled order {} (No: {})", order.getId(), order.getOrderNo());
    }

    private Map<String, OrderItemRequest> resolveItemsToOrder(UUID userId, UUID productId, UUID optionId, Integer quantity) {
        Map<String, OrderItemRequest> items = new HashMap<>();
        if (productId != null && quantity != null) {
            items.put(productId.toString() + (optionId != null ? ":" + optionId.toString() : ""), new OrderItemRequest(productId, optionId, quantity));
        } else {
            // 장바구니 로직 수정 필요 (옵션 정보 포함)
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        if (items.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        return items;
    }

    private Order initializeOrder(UUID userId, String receiverName, String phone, String address, String detailAddress) {
        Order order = Order.builder()
                .orderNo(generateOrderNo())
                .userId(userId)
                .totalAmount(BigDecimal.ZERO)
                .receiverName(receiverName)
                .phone(phone)
                .address(address)
                .detailAddress(detailAddress)
                .build();
        order.updateStatus(OrderStatus.PAID);
        return orderRepository.save(order);
    }

    private void processOrderItems(Order order, Map<String, OrderItemRequest> itemsToOrder) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemRequest request : itemsToOrder.values()) {
            OrderProductInfo info = fetchProductAndReduceStock(request.productId, request.optionId, request.quantity);
            
            // 명확한 계산: (단가) * 수량
            BigDecimal itemTotal = info.finalPrice.multiply(BigDecimal.valueOf(info.quantity));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(info.product.getId())
                    .quantity(info.quantity)
                    .price(info.finalPrice) // 단가 저장
                    .build();
            order.getOrderItems().add(item);
            
            totalAmount = totalAmount.add(itemTotal);
        }
        order.updateTotalAmount(totalAmount);
    }

    private OrderProductInfo fetchProductAndReduceStock(UUID productId, UUID optionId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // 기본 단위 가격으로 초기화
        BigDecimal unitPrice = product.getPrice();
        
        // 옵션이 있는 경우 추가 금액 합산
        if (optionId != null) {
            ProductOption option = productOptionRepository.findById(optionId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
            if (!option.getProduct().getId().equals(productId)) {
                 throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
            }
            option.removeStock(quantity);
            // 0원인 옵션의 경우에도 추가 금액이 0이므로 기본 가격이 유지됨
            unitPrice = unitPrice.add(option.getAdditionalPrice());
        } else {
            product.removeStock(quantity);
        }
        
        return new OrderProductInfo(product, unitPrice, quantity);
    }

    private static class OrderItemRequest {
        final UUID productId;
        final UUID optionId;
        final int quantity;
        OrderItemRequest(UUID productId, UUID optionId, int quantity) {
            this.productId = productId;
            this.optionId = optionId;
            this.quantity = quantity;
        }
    }

    private static class OrderProductInfo {
        final Product product;
        final BigDecimal finalPrice;
        final int quantity;
        OrderProductInfo(Product product, BigDecimal finalPrice, int quantity) {
            this.product = product;
            this.finalPrice = finalPrice;
            this.quantity = quantity;
        }
    }

    private void finalizeOrder(Order order, UUID userId, boolean clearCart) {
        orderRepository.save(order);
        if (clearCart) {
            cartService.clearCart(userId);
        }
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrderDetails(UUID userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserId(userId, pageable);
        if (orders.isEmpty()) return Page.empty();

        Set<UUID> productIds = orders.getContent().stream()
                .flatMap(order -> order.getOrderItems().stream())
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());

        Map<UUID, String> productNames = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Product::getName));

        return orders.map(order -> convertToOrderResponse(order, productNames));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        
        Set<UUID> productIds = order.getOrderItems().stream()
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());
        
        Map<UUID, String> productNames = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Product::getName));

        return convertToOrderResponse(order, productNames);
    }

    private OrderResponse convertToOrderResponse(Order order, Map<UUID, String> productNames) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(productNames.getOrDefault(item.getProductId(), "알 수 없는 상품"))
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());
        
        return OrderResponse.from(order, itemResponses);
    }

    @Transactional(readOnly = true)
    public ShippingInfoResponse getRecentShippingInfo(UUID userId) {
        Page<Order> ordersPage = orderRepository.findByUserId(userId, 
                PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt")));
        if (ordersPage.isEmpty()) return null;
 
        Order recentOrder = ordersPage.getContent().get(0);
        return ShippingInfoResponse.builder()
                .receiverName(recentOrder.getReceiverName())
                .phone(recentOrder.getPhone())
                .address(recentOrder.getAddress())
                .detailAddress(recentOrder.getDetailAddress())
                .build();
    }

    private String generateOrderNo() {
        return java.time.LocalDate.now().toString().replace("-", "") + 
               "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void saveOutboxEvent(Order order, UUID userId, BigDecimal totalAmount) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "orderId", order.getId().toString(),
                    "totalAmount", totalAmount.toString(),
                    "userId", userId.toString()
            ));

            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType("ORDER")
                    .aggregateId(order.getId().toString())
                    .eventType("PAYMENT_REQUEST")
                    .payload(payload)
                    .build();
            outboxRepository.save(event);
        } catch (Exception e) {
            log.error("[Order] Outbox serialization failed", e);
        }
    }
}
