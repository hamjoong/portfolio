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
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "올바르지 않은 입력값입니다. 입력 양식을 확인해 주세요."),
    HANDLE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "C002", "접근 권한이 없습니다. 관리자에게 문의하세요."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C003", "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),

    // 인증/회원
    EMAIL_DUPLICATION(HttpStatus.BAD_REQUEST, "U001", "이미 가입된 이메일입니다. 다른 이메일을 입력하거나 비밀번호 찾기를 진행해 주세요."),
    LOGIN_INPUT_INVALID(HttpStatus.BAD_REQUEST, "U002", "이메일 또는 비밀번호가 일치하지 않습니다. 정보를 다시 확인해 주세요."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U003", "사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요."),
    USER_INACTIVE(HttpStatus.FORBIDDEN, "U004", "비활성화된 계정입니다. 서비스 이용을 위해 고객센터로 문의해 주세요."),
    
    // 상품/주문
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "해당 상품을 찾을 수 없습니다. 상품 번호를 다시 확인해 주세요."),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "O001", "주문 내역을 찾을 수 없습니다. 주문 상세 정보를 다시 확인해 주세요."),

    ENCRYPTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "S001", "데이터 처리 중 오류가 발생했습니다. 고객센터로 문의해 주세요.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
