package com.projectx.auth.dto;

import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.entity.ProductOption;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private String mainImageUrl;
    private String vendor;
    private List<ProductOptionResponse> options; // [추가] 옵션 정보

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
                .mainImageUrl(product.getMainImageUrl())
                .vendor("Hjuk 공식 스토어")
                .options(product.getOptions().stream()
                        .map(ProductOptionResponse::from)
                        .collect(Collectors.toList()))
                .build();
    }

    @Getter
    @Builder
    public static class ProductOptionResponse {
        private UUID id;
        private String optionType;
        private String optionName;
        private BigDecimal additionalPrice;
        private int stockQuantity;

        public static ProductOptionResponse from(ProductOption option) {
            return ProductOptionResponse.builder()
                    .id(option.getId())
                    .optionType(option.getOptionType())
                    .optionName(option.getOptionName())
                    .additionalPrice(option.getAdditionalPrice())
                    .stockQuantity(option.getStockQuantity())
                    .build();
        }
    }
}
