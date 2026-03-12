package com.projectx.auth.service;

import com.projectx.auth.domain.entity.*;
import com.projectx.auth.domain.repository.OrderRepository;
import com.projectx.auth.domain.repository.OutboxRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.dto.OrderItemResponse;
import com.projectx.auth.dto.OrderResponse;
import com.projectx.auth.dto.ShippingInfoResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        Map<String, Integer> itemsToOrder = new HashMap<>();

        if (productId != null && quantity != null) {
            itemsToOrder.put(productId.toString(), quantity);
        } else {
            itemsToOrder.putAll(cartService.getCartItems(userId));
        }

        if (itemsToOrder.isEmpty()) {
            throw new RuntimeException("주문할 상품이 없습니다.");
        }

        String orderNo = generateOrderNo();
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        Order order = orderRepository.save(Order.builder()
                .orderNo(orderNo)
                .userId(userId)
                .totalAmount(BigDecimal.ZERO)
                .receiverName(receiverName)
                .phone(phone)
                .address(address)
                .detailAddress(detailAddress)
                .build());

        for (Map.Entry<String, Integer> entry : itemsToOrder.entrySet()) {
            UUID pId = UUID.fromString(entry.getKey());
            int q = entry.getValue();

            Product product = productRepository.findById(pId)
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));
            product.removeStock(q);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(pId)
                    .quantity(q)
                    .price(product.getPrice())
                    .build();
            order.getOrderItems().add(item);
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(q)));
        }

        order.updateTotalAmount(totalAmount);
        orderRepository.save(order);

        if (productId == null) {
            cartService.clearCart(userId);
        }

        saveOutboxEvent(order, userId, totalAmount);

        log.info("[Order] Created order {} (No: {}) for user {}", order.getId(), orderNo, userId);
        return order.getId();
    }

    /**
     * 특정 사용자의 모든 주문 내역을 상세 정보와 함께 조회합니다.
     * [최적화] 상품 정보를 개별적으로 쿼리하지 않고, 필요한 상품들을 IN 절로 한 번에 조회하여 매핑합니다.
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrderDetails(UUID userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (orders.isEmpty()) return Collections.emptyList();

        // 1. 조회된 모든 주문에서 상품 ID 추출 (중복 제거)
        Set<UUID> productIds = orders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());

        // 2. 상품 정보를 Bulk로 조회하여 Map으로 구성 (In-memory 캐싱 효과)
        Map<UUID, String> productNames = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Product::getName));

        // 3. 주문 정보를 응답 DTO로 변환 시 Map에서 상품명 참조
        return orders.stream()
                .map(order -> convertToOrderResponse(order, productNames))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));
        
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
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (orders.isEmpty()) return null;

        Order recentOrder = orders.get(0);
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
