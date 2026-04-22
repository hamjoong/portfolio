package com.hjuk.devcodehub.global.error.exception;

import lombok.Getter;

/** [Why] 비즈니스 로직 처리 중 발생하는 예외를 관리하는 커스텀 예외 클래스입니다. */
@Getter
public class BusinessException extends RuntimeException {
  private final ErrorCode errorCode;

  public BusinessException(String inputMessage, ErrorCode inputErrorCode) {
    super(inputMessage);
    this.errorCode = inputErrorCode;
  }

  public BusinessException(ErrorCode inputErrorCode) {
    super(inputErrorCode.getMessage());
    this.errorCode = inputErrorCode;
  }
}
