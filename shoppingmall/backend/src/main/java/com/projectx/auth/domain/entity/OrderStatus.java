package com.projectx.auth.domain.entity;

import lombok.Getter;

/**
 * 주문의 처리 상태를 나타내는 열거형입니다.
 * [이유] 주문 생성부터 결제, 배송, 취소에 이르는 
 * 라이프사이클을 명확히 관리하여 비즈니스 일관성을 유지하기 위함입니다.
 */
@Getter
public enum OrderStatus {
    PENDING("결제대기"),
    PAID("결제완료"),
    CANCELLED("주문취소"),
    SHIPPED("배송중"),
    COMPLETED("배송완료");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }
}
