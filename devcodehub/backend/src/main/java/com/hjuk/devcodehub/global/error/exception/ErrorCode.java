package com.hjuk.devcodehub.global.error.exception;

import lombok.Getter;

/** [Why] 전역 에러 코드를 관리하는 열거형입니다. */
@Getter
public enum ErrorCode {
  // Common
  INVALID_INPUT_VALUE(400, "C001", " 올바르지 않은 입력값입니다."),
  METHOD_NOT_ALLOWED(405, "C002", " 허용되지 않은 메소드입니다."),
  ENTITY_NOT_FOUND(404, "C003", " 요소를 찾을 수 없습니다."),
  INTERNAL_SERVER_ERROR(500, "C004", " 서버 내부 오류가 발생했습니다."),
  INVALID_TYPE_VALUE(400, "C005", " 올바르지 않은 타입입니다."),
  HANDLE_ACCESS_DENIED(403, "C006", " 권한이 없습니다."),

  // User
  USER_NOT_FOUND(404, "U001", " 사용자를 찾을 수 없습니다."),
  LOGIN_ID_DUPLICATE(400, "U002", " 이미 존재하는 로그인 ID입니다."),
  EMAIL_DUPLICATE(400, "U003", " 이미 존재하는 이메일입니다."),
  LOGIN_FAIL(401, "U004", " 아이디 또는 비밀번호가 일치하지 않습니다."),
  NICKNAME_DUPLICATE(400, "U005", " 이미 존재하는 닉네임입니다."),

  // Board
  BOARD_NOT_FOUND(404, "B001", " 게시글을 찾을 수 없습니다."),
  COMMENT_NOT_FOUND(404, "B002", " 댓글을 찾을 수 없습니다."),

  // Review
  REVIEW_NOT_FOUND(404, "R001", " 리뷰 정보를 찾을 수 없습니다."),
  ALREADY_APPLIED(400, "R002", " 이미 지원한 요청입니다."),
  NOT_A_SENIOR(403, "R003", " 시니어 회원만 이용 가능합니다."),
  INVALID_REVIEW_STATUS(400, "R004", " 올바르지 않은 리뷰 상태입니다.");

  private final int status;
  private final String code;
  private final String message;

  ErrorCode(final int inputStatus, final String inputCode, final String inputMessage) {
    this.status = inputStatus;
    this.code = inputCode;
    this.message = inputMessage;
  }
}
