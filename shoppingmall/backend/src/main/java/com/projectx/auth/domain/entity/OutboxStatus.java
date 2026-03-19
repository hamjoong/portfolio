package com.projectx.auth.domain.entity;

import lombok.Getter;

/**
 * 아웃박스 이벤트의 처리 상태를 나타내는 열거형입니다.
 * [이유] 이벤트가 생성된 시점(INIT)부터 외부 시스템 전송 완료(PROCESSED)까지의
 * 상태를 추적하여 재시도 및 감사 로직을 수행하기 위함입니다.
 */
@Getter
public enum OutboxStatus {
    INIT("처리대기"),
    PROCESSED("처리완료"),
    FAILED("처리실패");

    private final String description;

    OutboxStatus(String description) {
        this.description = description;
    }
}
