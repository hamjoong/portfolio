package com.hjuk.devcodehub.domain.user.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AdminActionType {
  USER_ROLE_CHANGE("유저 권한 변경"),
  CREDIT_ADJUST("크레딧 강제 조정"),
  SUBSCRIPTION_MANAGE("구독 상태 변경"),
  BOARD_DELETE("게시글 강제 삭제"),
  COMMENT_DELETE("댓글 강제 삭제"),
  REVIEW_CANCEL("리뷰 매칭 강제 취소");

  private final String description;
}
