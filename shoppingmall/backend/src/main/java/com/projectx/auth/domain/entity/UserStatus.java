package com.projectx.auth.domain.entity;

import lombok.Getter;

/**
 * 사용자 계정의 현재 상태를 나타내는 열거형입니다.
 * [이유] 활성, 잠금, 탈퇴 등의 상태를 코드 레벨에서 타입 안전하게 관리하여
 * 오동작을 방지하고 비즈니스 로직의 명확성을 확보하기 위함입니다.
 */
@Getter
public enum UserStatus {
    ACTIVE("활성"),
    INACTIVE("비활성"),
    LOCKED("잠금"),
    WITHDRAWN("탈퇴"),
    GUEST("비회원");

    private final String description;

    UserStatus(String description) {
        this.description = description;
    }
}
