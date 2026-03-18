package com.projectx.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 인증 관련 API의 공통 응답 형식을 정의합니다.
 */
@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;
    private Data data;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Data {
        private UUID userId;
        private String accessToken;
        private String refreshToken;
        private String role; // [추가] 사용자 권한 정보
    }

    public static AuthResponse success(String message, UUID userId, String accessToken, String role) {
        return AuthResponse.builder()
                .success(true)
                .message(message)
                .data(Data.builder()
                        .userId(userId)
                        .accessToken(accessToken)
                        .role(role)
                        .build())
                .build();
    }
}
