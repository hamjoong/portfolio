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
   * [Why] DB 제약 조건 위반의 원인(SQL·제약명)은 스키마를 드러내므로 응답에 싣지 않고 로그로만 남깁니다.
   *
   * @param e DataIntegrityViolationException 객체
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
  protected ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(
      org.springframework.dao.DataIntegrityViolationException e) {
    log.warn("데이터 무결성 위반: {}", e.getMostSpecificCause().getMessage());
    ApiResponse<Void> response =
        ApiResponse.error(
            ErrorCode.INVALID_INPUT_VALUE.getCode(), "데이터 무결성 위반이 발생했습니다. 입력값을 확인해 주세요.");
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  /**
   * [Why] 권한 부족(@PreAuthorize 등)을 500이 아닌 403으로 돌려줍니다.
   *
   * @param e AccessDeniedException 객체
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
  protected ResponseEntity<ApiResponse<Void>> handleAccessDenied(
      org.springframework.security.access.AccessDeniedException e) {
    ErrorCode code = ErrorCode.HANDLE_ACCESS_DENIED;
    return new ResponseEntity<>(
        ApiResponse.error(code.getCode(), code.getMessage().trim()), HttpStatus.FORBIDDEN);
  }

  /**
   * [Why] 존재하지 않는 경로는 500이 아닌 404로 돌려줍니다.
   *
   * @param e 경로 없음 예외
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler({
    org.springframework.web.servlet.resource.NoResourceFoundException.class,
    org.springframework.web.servlet.NoHandlerFoundException.class
  })
  protected ResponseEntity<ApiResponse<Void>> handleNotFound(Exception e) {
    ErrorCode code = ErrorCode.NOT_FOUND;
    return new ResponseEntity<>(
        ApiResponse.error(code.getCode(), code.getMessage().trim()), HttpStatus.NOT_FOUND);
  }

  /**
   * [Why] 허용되지 않은 HTTP 메소드를 405로 돌려줍니다.
   *
   * @param e 메소드 불일치 예외
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
  protected ResponseEntity<ApiResponse<Void>> handleMethodNotAllowed(
      org.springframework.web.HttpRequestMethodNotSupportedException e) {
    ErrorCode code = ErrorCode.METHOD_NOT_ALLOWED;
    return new ResponseEntity<>(
        ApiResponse.error(code.getCode(), code.getMessage().trim()), HttpStatus.METHOD_NOT_ALLOWED);
  }

  /**
   * [Why] 잘못된 본문·파라미터·타입은 클라이언트 오류이므로 400으로 돌려줍니다. (예외 메시지는 노출하지 않음)
   *
   * @param e 요청 형식 오류 예외
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler({
    org.springframework.http.converter.HttpMessageNotReadableException.class,
    org.springframework.web.bind.MissingServletRequestParameterException.class,
    org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
    jakarta.validation.ConstraintViolationException.class,
    IllegalArgumentException.class
  })
  protected ResponseEntity<ApiResponse<Void>> handleBadRequest(Exception e) {
    log.debug("잘못된 요청: {}", e.getMessage());
    ErrorCode code = ErrorCode.INVALID_TYPE_VALUE;
    return new ResponseEntity<>(
        ApiResponse.error(code.getCode(), code.getMessage().trim()), HttpStatus.BAD_REQUEST);
  }

  /**
   * [Why] 예상치 못한 시스템 내부 예외를 최종적으로 방어합니다. 상세 원인은 서버 로그에만 남기고 응답에는 일반 문구만 담습니다.
   *
   * @param e Exception 객체
   * @return 표준 에러 응답이 포함된 ResponseEntity
   */
  @ExceptionHandler(Exception.class)
  protected ResponseEntity<ApiResponse<Void>> handleAllExceptions(Exception e) {
    log.error("예상치 못한 예외 발생! 상세 정보: ", e);
    ApiResponse<Void> response =
        ApiResponse.error(
            ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
            ErrorCode.INTERNAL_SERVER_ERROR.getMessage().trim());
    return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
