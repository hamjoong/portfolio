package com.hjuk.devcodehub.domain.notification.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class SeniorVerificationEvent {
  public enum Type {
    REQUESTED,
    APPROVED,
    REJECTED
  }

  private final Type type;
  private final String juniorLoginId;
  private final String juniorNickname;
  private final String reason; // 반려 시 사용
}
