package com.hjuk.devcodehub.domain.notification.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class SeniorMatchedEvent {
  private final String juniorLoginId;
  private final String seniorNickname;
  private final String requestTitle;
}
