package com.projectx.auth.dto;
 
import com.projectx.auth.exception.ErrorCode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();
    private boolean success;
    private String message;
    private String code; // [추가] 에러 코드 (성공 시 null)
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("요청이 성공적으로 처리되었습니다.")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(errorCode.getMessage())
                .code(errorCode.getCode())
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .code(errorCode.getCode())
                .build();
    }
}
