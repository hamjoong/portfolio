package com.hjuk.devcodehub.domain.notification.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ReviewCompletedEvent {
  private final Long requestId;
  private final String juniorLoginId;
  private final String title;
}
