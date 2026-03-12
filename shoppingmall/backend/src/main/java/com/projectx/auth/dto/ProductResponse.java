package com.projectx.auth.dto;

import com.projectx.auth.domain.entity.Product;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 상품 정보를 클라이언트에게 전달하기 위한 응답 객체입니다.
 */
@Getter
@Builder
public class ProductResponse {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private String categoryName;
    private String mainImageUrl; // [추가] 상품 대표 이미지 URL

    /**
     * 엔티티 객체를 DTO 객체로 변환합니다.
     */
    public static ProductResponse from(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .mainImageUrl(product.getMainImageUrl()) // 이제 정상적으로 참조 가능
                .build();
    }
}
