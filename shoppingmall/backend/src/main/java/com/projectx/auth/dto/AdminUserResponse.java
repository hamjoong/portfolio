package com.projectx.auth.dto;

import com.projectx.auth.domain.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 관리자 페이지의 사용자 목록에 필요한 데이터만 선별하여 전달하는 DTO입니다.
 * [보안] User 엔티티의 password 필드 등 민감한 정보가 API를 통해 노출되는 것을 방지합니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private UUID id;
    private String email;
    private String role;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
