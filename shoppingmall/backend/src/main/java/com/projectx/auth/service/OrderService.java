package com.projectx.auth.service;

import com.projectx.auth.domain.entity.*;
import com.projectx.auth.domain.repository.OrderRepository;
import com.projectx.auth.domain.repository.OutboxRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.dto.OrderItemResponse;
import com.projectx.auth.dto.OrderResponse;
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
 * [최적화] N+1 문제를 해결하기 위해 Bulk Fetching 및 In-memory 매핑 전략을 적용했습니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OutboxRepository outboxRepository;
    private final CartService cartService;
    private final ObjectMapper objectMapper;

    @Transactional
    public UUID createOrder(UUID userId, UUID productId, Integer quantity, 
                            String receiverName, String phone, String address, String detailAddress) {
        Map<String, Integer> itemsToOrder = resolveItemsToOrder(userId, productId, quantity);
        
        Order order = initializeOrder(userId, receiverName, phone, address, detailAddress);
        processOrderItems(order, itemsToOrder);
        
        finalizeOrder(order, userId, productId == null);

        saveOutboxEvent(order, userId, order.getTotalAmount());

        log.info("[Order] Created order {} (No: {}) for user {}", order.getId(), order.getOrderNo(), userId);
        return order.getId();
    }

    private Map<String, Integer> resolveItemsToOrder(UUID userId, UUID productId, Integer quantity) {
        Map<String, Integer> items = new HashMap<>();
        if (productId != null && quantity != null) {
            items.put(productId.toString(), quantity);
        } else {
            items.putAll(cartService.getCartItems(userId));
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

    private void processOrderItems(Order order, Map<String, Integer> itemsToOrder) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Map.Entry<String, Integer> entry : itemsToOrder.entrySet()) {
            OrderProductInfo info = fetchProductAndReduceStock(UUID.fromString(entry.getKey()), entry.getValue());
            
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(info.product.getId())
                    .quantity(info.quantity)
                    .price(info.product.getPrice())
                    .build();
            order.getOrderItems().add(item);
            totalAmount = totalAmount.add(info.product.getPrice().multiply(BigDecimal.valueOf(info.quantity)));
        }
        order.updateTotalAmount(totalAmount);
    }

    private OrderProductInfo fetchProductAndReduceStock(UUID productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        product.removeStock(quantity);
        return new OrderProductInfo(product, quantity);
    }

    private void finalizeOrder(Order order, UUID userId, boolean clearCart) {
        orderRepository.save(order);
        if (clearCart) {
            cartService.clearCart(userId);
        }
    }

    private static class OrderProductInfo {
        final Product product;
        final int quantity;
        OrderProductInfo(Product product, int quantity) {
            this.product = product;
            this.quantity = quantity;
        }
    }

    /**
     * 특정 사용자의 모든 주문 내역을 상세 정보와 함께 조회합니다.
     * [최적화] 상품 정보를 개별적으로 쿼리하지 않고, 필요한 상품들을 IN 절로 한 번에 조회하여 매핑합니다.
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrderDetails(UUID userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserId(userId, pageable);
        if (orders.isEmpty()) return Page.empty();

        // 1. 조회된 모든 주문에서 상품 ID 추출 (중복 제거)
        Set<UUID> productIds = orders.getContent().stream()
                .flatMap(order -> order.getOrderItems().stream())
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());

        // 2. 상품 정보를 Bulk로 조회하여 Map으로 구성
        Map<UUID, String> productNames = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Product::getName));

        // 3. 주문 정보를 응답 DTO로 변환
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
