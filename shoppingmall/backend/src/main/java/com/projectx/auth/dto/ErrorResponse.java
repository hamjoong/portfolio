package com.projectx.auth.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 전역 예외 처리 시 반환할 표준 에러 응답 형식입니다.
 * [이유] 모든 API 에러의 응답 구조를 통일하여 클라이언트가 에러 정보를
 * 일관되게 처리하고 사용자에게 적절한 안내를 제공하기 위함입니다.
 */
@Getter
@Builder
public class ErrorResponse {
    private final LocalDateTime timestamp = LocalDateTime.now();
    private final int status;
    private final String code;
    private final String message;
    private final List<FieldError> errors;

    /**
     * 입력값 검증 실패 시 상세 에러 정보를 담기 위한 내부 클래스입니다.
     */
    @Getter
    @Builder
    public static class FieldError {
        private final String field;
        private final String value;
        private final String reason;
    }
}
