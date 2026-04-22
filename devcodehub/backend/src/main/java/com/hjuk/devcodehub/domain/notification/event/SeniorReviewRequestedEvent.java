package com.hjuk.devcodehub.domain.notification.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class SeniorReviewRequestedEvent {
  private final String juniorNickname;
  private final String requestTitle;
}
