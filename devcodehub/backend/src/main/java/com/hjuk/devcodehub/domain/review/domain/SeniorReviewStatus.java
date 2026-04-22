package com.hjuk.devcodehub.domain.review.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SeniorReviewStatus {
  PENDING("지원 대기 중"),
  MATCHED("매칭 완료 / 리뷰 진행 중"),
  COMPLETED("리뷰 완료"),
  CANCELED("취소됨");

  private final String description;
}
