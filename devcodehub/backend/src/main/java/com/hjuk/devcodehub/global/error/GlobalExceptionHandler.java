package com.hjuk.devcodehub.global.error;

import com.hjuk.devcodehub.global.common.ApiResponse;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** [Why] 전역 예외 처리기. TRD 5항 및 API 표준에 따라 통일된 ApiResponse 구조로 실패 응답을 제공합니다. */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

  /**
   * [Why] 비즈니스 로직 수준에서 정의된 예외(BusinessException)를 캡처하여 클라이언트에게 표준 에러 규격을 전달합니다.
   *
   * @param e BusinessException 객체
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler(BusinessException.class)
  protected ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
    ErrorCode errorCode = e.getErrorCode();
    ApiResponse<Void> response = ApiResponse.error(errorCode.getCode(), e.getMessage());
    return new ResponseEntity<>(response, HttpStatus.valueOf(errorCode.getStatus()));
  }

  /**
   * [Why] @Valid 어노테이션을 통한 DTO 검증 실패 시 발생하는 예외를 처리하여 사용자에게 직관적인 피드백을 제공합니다.
   *
   * @param e MethodArgumentNotValidException 객체
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  protected ResponseEntity<ApiResponse<Void>> handleValidationException(
      MethodArgumentNotValidException e) {
    String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
    ApiResponse<Void> response =
        ApiResponse.error(ErrorCode.INVALID_INPUT_VALUE.getCode(), message);
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  /**
   * [Why] DB 제약 조건 위반 발생 시 서버 에러 대신 400 에러와 적절한 메시지를 반환합니다.
   *
   * @param e DataIntegrityViolationException 객체
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
  protected ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(
      org.springframework.dao.DataIntegrityViolationException e) {
    String rootMsg = e.getRootCause() != null ? e.getRootCause().getMessage() : e.getMessage();
    String friendlyMsg = "데이터 무결성 위반이 발생했습니다. 입력값을 확인해 주세요. 상세: " + rootMsg;
    ApiResponse<Void> response =
        ApiResponse.error(ErrorCode.INVALID_INPUT_VALUE.getCode(), friendlyMsg);
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  /**
   * [Why] 예상치 못한 시스템 내부 예외를 최종적으로 방어하고 서버 로그를 기록합니다.
   *
   * @param e Exception 객체
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler(Exception.class)
  protected ResponseEntity<ApiResponse<Void>> handleAllExceptions(Exception e) {
    log.error("예상치 못한 예외 발생! 상세 정보: ", e);
    // [DEBUG] 추측 방지 및 팩트 체크를 위해 실제 에러 원인을 클라이언트에 노출 (해결 후 삭제 예정)
    String detailedMessage = e.getMessage() != null ? e.getMessage() : e.toString();
    if (e.getCause() != null) {
      detailedMessage += " | Caused by: " + e.getCause().getMessage();
    }
    ApiResponse<Void> response =
        ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), detailedMessage);
    return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
