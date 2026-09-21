package com.projectx.auth.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 관리자가 상품을 신규 등록할 때 사용하는 요청 객체입니다.
 */
@Getter
@NoArgsConstructor
public class ProductCreateRequest {

    @NotBlank(message = "상품명은 필수입니다.")
    private String name;

    private String description;

    @NotNull(message = "가격은 필수입니다.")
    @PositiveOrZero(message = "가격은 0원 이상이어야 합니다.")
    private BigDecimal price;

    @PositiveOrZero(message = "재고는 0개 이상이어야 합니다.")
    private int stockQuantity;

    private Long categoryId;

    private String imageUrl;

    @Valid
    private List<ProductOptionRequest> options; // [추가] 옵션 정보

    @Getter
    @NoArgsConstructor
    public static class ProductOptionRequest {
        @NotBlank(message = "옵션 분류는 필수입니다.")
        private String optionType; // 예: 사이즈, 색상

        @NotBlank(message = "옵션 이름은 필수입니다.")
        private String optionName; // 예: XL, 빨간색

        @NotNull(message = "추가 금액은 필수입니다.")
        @PositiveOrZero(message = "추가 금액은 0원 이상이어야 합니다.")
        private BigDecimal additionalPrice;

        @PositiveOrZero(message = "옵션 재고는 0개 이상이어야 합니다.")
        private int stockQuantity;
    }
}
