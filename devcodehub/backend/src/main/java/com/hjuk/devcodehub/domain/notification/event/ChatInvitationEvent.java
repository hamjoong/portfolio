package com.hjuk.devcodehub.domain.notification.event;

import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ChatInvitationEvent {
  private final List<String> targetLoginIds;
  private final String inviterNickname;
}
