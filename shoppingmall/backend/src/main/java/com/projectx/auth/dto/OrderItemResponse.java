package com.projectx.auth.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class OrderItemResponse {
    private Long id;
    private UUID productId;
    private String productName;
    private int quantity;
    private BigDecimal price;
}
