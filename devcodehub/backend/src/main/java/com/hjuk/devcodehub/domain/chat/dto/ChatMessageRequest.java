package com.hjuk.devcodehub.domain.chat.dto;

import com.hjuk.devcodehub.domain.chat.domain.ChatMessageType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChatMessageRequest {
  private Long roomId;
  private String senderLoginId;
  private String message;
  private ChatMessageType type;
}
