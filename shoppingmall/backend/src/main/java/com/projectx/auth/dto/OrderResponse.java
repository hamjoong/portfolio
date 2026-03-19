package com.projectx.auth.dto;

import com.projectx.auth.domain.entity.Order;
import com.projectx.auth.domain.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class OrderResponse {
    private UUID id;
    private String orderNo;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String receiverName;
    private String phone;
    private String address;
    private String detailAddress;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> orderItems;

    public static OrderResponse from(Order order, List<OrderItemResponse> itemResponses) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .receiverName(order.getReceiverName())
                .phone(order.getPhone())
                .address(order.getAddress())
                .detailAddress(order.getDetailAddress())
                .createdAt(order.getCreatedAt())
                .orderItems(itemResponses)
                .build();
    }
}
