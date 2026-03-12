package com.projectx.auth.config;

import com.projectx.auth.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 전역 예외 처리기입니다.
 * [이유] 모든 에러 응답을 ApiResponse 표준 규격으로 통일하여 프론트엔드의 에러 처리를 간소화하고,
 * 특정 예외(낙관적 락 등)에 대한 맞춤형 응답을 제공하기 위함입니다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Bean Validation 검증 실패 시 호출됩니다.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String details = e.getBindingResult().getFieldErrors().stream()
                .map(error -> String.format("[%s: %s]", error.getField(), error.getDefaultMessage()))
                .collect(Collectors.joining(", "));
        
        log.warn("[Exception] Validation failed: {}", details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("입력값이 올바르지 않습니다: " + details));
    }

    /**
     * 낙관적 락(Optimistic Lock) 충돌 시 발생합니다.
     * [이유] 동시 주문 시 재고 부족 등으로 인한 충돌을 사용자에게 친절하게 알리기 위함입니다.
     */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    protected ResponseEntity<ApiResponse<Object>> handleOptimisticLockingFailureException(ObjectOptimisticLockingFailureException e) {
        log.warn("[Exception] Optimistic lock conflict: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("동시 요청이 많아 처리에 실패했습니다. 잠시 후 다시 시도해주세요."));
    }

    /**
     * 비즈니스 로직 상의 예외(RuntimeException)를 처리합니다.
     */
    @ExceptionHandler(RuntimeException.class)
    protected ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException e) {
        log.error("[Exception] Business logic error: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
    }

    /**
     * 예상치 못한 최상위 예외를 처리합니다. (보안을 위해 메시지 마스킹)
     */
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ApiResponse<Object>> handleException(Exception e) {
        log.error("[Exception] Critical server error: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 운영팀에 문의해주시기 바랍니다. (Internal Error)"));
    }
}
