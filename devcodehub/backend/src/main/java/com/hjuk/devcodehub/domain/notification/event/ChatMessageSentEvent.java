package com.hjuk.devcodehub.domain.notification.event;

import com.hjuk.devcodehub.domain.chat.dto.ChatMessageResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ChatMessageSentEvent {
  private final ChatMessageResponse message;
  private final java.util.List<String> participantLoginIds;
}
