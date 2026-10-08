package com.hjuk.devcodehub.domain.chat.dto;

import com.hjuk.devcodehub.domain.chat.domain.ChatMessage;
import com.hjuk.devcodehub.domain.chat.domain.ChatMessageType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
  private Long id;
  private Long roomId;
  private String senderLoginId;
  private String senderNickname;
  private String message;
  private ChatMessageType type;
  private LocalDateTime createdAt;
  private String senderInstanceId;

  public ChatMessageResponse(ChatMessage chatMessage) {
    this.id = chatMessage.getId();
    this.roomId = chatMessage.getChatRoom().getId();
    this.senderLoginId = chatMessage.getSender().getLoginId();
    this.senderNickname = chatMessage.getSender().getNickname();
    this.message = chatMessage.getMessage();
    this.type = chatMessage.getType();
    this.createdAt = chatMessage.getCreatedAt();
  }
}
