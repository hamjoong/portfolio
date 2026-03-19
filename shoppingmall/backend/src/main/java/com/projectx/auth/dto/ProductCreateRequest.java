package com.projectx.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 관리자가 상품을 신규 등록할 때 사용하는 요청 객체입니다.
 * [이유] 상품 기본 정보와 S3에 업로드된 이미지 경로를 통합하여
 * 서버에서 한 번에 저장 처리하기 위함입니다.
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

    /**
     * S3에 업로드된 메인 이미지의 URL입니다.
     * [이유] 프론트엔드에서 S3로 직접 업로드한 후 반환받은 경로를 
     * DB에 저장하여 상품과 매핑하기 위함입니다.
     */
    private String imageUrl;
}
