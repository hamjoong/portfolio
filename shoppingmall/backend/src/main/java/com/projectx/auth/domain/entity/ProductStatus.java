package com.projectx.auth.domain.entity;

import lombok.Getter;

/**
 * 상품의 현재 판매 상태를 나타내는 열거형입니다.
 * [이유] 재고 유무나 판매자의 의사에 따라 상품 노출을 즉각 제어하고
 * 비즈니스 로직의 명확성을 확보하기 위함입니다.
 */
@Getter
public enum ProductStatus {
    FOR_SALE("판매중"),
    SOLD_OUT("품절"),
    HIDDEN("숨김");

    private final String description;

    ProductStatus(String description) {
        this.description = description;
    }
}
