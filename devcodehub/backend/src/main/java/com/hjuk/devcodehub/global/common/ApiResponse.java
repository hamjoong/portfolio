package com.hjuk.devcodehub.global.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 전역 공통 응답 객체 TRD 5항: {"success": true, "data": {...}} 또는 {"success": false, "error": {...}} 구조를
 * 따릅니다.
 *
 * @param <T> 응답 데이터의 타입
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public final class ApiResponse<T> {

  private boolean success;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  private T data;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  private ErrorDetail error;

  private ApiResponse(boolean inputSuccess, T inputData, ErrorDetail inputError) {
    this.success = inputSuccess;
    this.data = inputData;
    this.error = inputError;
  }

  /**
   * [Why] 성공 응답을 생성합니다.
   *
   * @param <T> 응답 데이터 타입
   * @param inputData 성공 시 반환할 데이터
   * @return 성공 응답 객체
   */
  public static <T> ApiResponse<T> success(T inputData) {
    return new ApiResponse<>(true, inputData, null);
  }

  /**
   * [Why] 실패 응답을 생성합니다.
   *
   * @param inputCode 에러 코드
   * @param inputMessage 에러 메시지
   * @return 실패 응답 객체
   */
  public static ApiResponse<Void> error(String inputCode, String inputMessage) {
    return new ApiResponse<>(false, null, new ErrorDetail(inputCode, inputMessage));
  }

  @Getter
  @NoArgsConstructor(access = AccessLevel.PROTECTED)
  public static class ErrorDetail {
    private String code;
    private String message;

    public ErrorDetail(String inputCode, String inputMessage) {
      this.code = inputCode;
      this.message = inputMessage;
    }
  }
}
