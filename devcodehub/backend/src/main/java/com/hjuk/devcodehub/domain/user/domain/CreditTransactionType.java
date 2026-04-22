package com.hjuk.devcodehub.domain.user.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CreditTransactionType {
  RECHARGE("충전"),
  SPEND_AI("AI 리뷰 사용"),
  SPEND_SENIOR("시니어 리뷰 요청"),
  EARN_REVIEW("리뷰 수행 보상"),
  COMMISSION("플랫폼 수수료 공제"),
  ADMIN_ADJUST("관리자 조정");

  private final String description;
}
