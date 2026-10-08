package com.hjuk.devcodehub.domain.chat.dto;

import com.hjuk.devcodehub.domain.chat.domain.ChatRoom;
import com.hjuk.devcodehub.domain.chat.domain.ChatRoomType;
import java.time.LocalDateTime;
import lombok.Getter;

/** [Why] 채팅방 목록 조회 시 응답 DTO입니다. */
@Getter
public class ChatRoomResponse {
  private final Long id;
  private final String name;
  private final ChatRoomType type;
  private final LocalDateTime createdAt;
  private final String lastMessage;
  private final LocalDateTime lastMessageTime;
  private final long unreadCount;

  /**
   * [Why] 채팅방 응답 DTO를 생성합니다.
   *
   * @param chatRoom             채팅방 엔티티
   * @param inputLastMessage     마지막 메시지 내용
   * @param inputLastMessageTime 마지막 메시지 전송 시간
   * @param inputUnreadCount     읽지 않은 메시지 수
   */
  public ChatRoomResponse(
      ChatRoom chatRoom,
      String inputLastMessage,
      LocalDateTime inputLastMessageTime,
      long inputUnreadCount) {
    this.id = chatRoom.getId();
    this.name = chatRoom.getName();
    this.type = chatRoom.getType();
    this.createdAt = chatRoom.getCreatedAt();
    this.lastMessage = inputLastMessage;
    this.lastMessageTime = inputLastMessageTime;
    this.unreadCount = inputUnreadCount;
  }
}
