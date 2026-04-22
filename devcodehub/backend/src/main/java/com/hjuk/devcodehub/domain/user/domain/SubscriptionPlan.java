package com.hjuk.devcodehub.domain.user.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SubscriptionPlan {
  WEEKLY("주간 구독"),
  MONTHLY("월간 구독"),
  YEARLY("년간 구독");

  private final String description;
}
