package com.projectx.auth.domain.entity;

/**
 * 시스템 전반에서 사용되는 권한 이름 상수 클래스입니다.
 * [이유] 문자열 오타로 인한 보안 취약점을 방지하고, 
 * 한 곳에서 권한 체계를 관리하기 위함입니다.
 */
public final class UserRoles {
    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_GUEST = "ROLE_GUEST";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_INTERNAL = "ROLE_INTERNAL";

    private UserRoles() {} // 인스턴스화 방지
}
