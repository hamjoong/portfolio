package com.projectx.auth.dto;

import com.projectx.auth.domain.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 어드민 페이지에서 상세한 사용자 정보를 표시하기 위한 DTO입니다.
 * [보안] KmsService에 의해 복호화된 민감 정보(이름, 전화번호, 주소)를 포함합니다.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDetailResponse {
    private UUID id;
    private String email;
    private UserStatus status;
    private String role;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    // 복호화된 개인 정보
    private String fullName;
    private String phoneNumber;
    private String address;
    private String detailAddress;
}
