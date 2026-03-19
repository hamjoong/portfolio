package com.projectx.auth.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 에러 코드와 메시지를 관리하는 열거형입니다.
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 공통
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "올바르지 않은 입력값입니다."),
    HANDLE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "C002", "접근이 거부되었습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C003", "서버 내부 오류가 발생했습니다."),

    // 인증/회원
    EMAIL_DUPLICATION(HttpStatus.BAD_REQUEST, "U001", "이미 존재하는 이메일입니다."),
    LOGIN_INPUT_INVALID(HttpStatus.BAD_REQUEST, "U002", "이메일 또는 비밀번호가 일치하지 않습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U003", "사용자를 찾을 수 없습니다."),
    USER_INACTIVE(HttpStatus.FORBIDDEN, "U004", "비활성화된 계정입니다."),
    
    // 상품/주문
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "상품을 찾을 수 없습니다."),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "O001", "주문을 찾을 수 없습니다."),

    ENCRYPTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "S001", "데이터 암호화 중 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
