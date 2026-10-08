package com.hjuk.devcodehub.domain.user.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VerificationStatus {
  PENDING("대기 중"),
  APPROVED("승인됨"),
  REJECTED("반려됨");

  private final String description;
}
