package com.hjuk.devcodehub.domain.chat.domain;

import com.hjuk.devcodehub.domain.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.Index;

/** [Why] 채팅 메시지 정보를 관리하는 도메인 엔티티입니다. */
@Entity
@Table(
    name = "chat_messages",
    indexes = {
      @Index(name = "idx_chat_room_created_at", columnList = "chat_room_id, createdAt"),
      @Index(name = "idx_chat_room_id", columnList = "chat_room_id, id")
    })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "chat_room_id", nullable = false)
  private ChatRoom chatRoom;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User sender;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ChatMessageType type;

  private LocalDateTime createdAt;

  /**
   * [Why] 새로운 채팅 메시지를 생성합니다.
   *
   * @param chatRoom 채팅방 정보
   * @param sender   발신자 정보
   * @param message  메시지 내용
   * @param type     메시지 타입
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public ChatMessage(ChatRoom chatRoom, User sender, String message, ChatMessageType type) {
    this.chatRoom = chatRoom;
    this.sender = sender;
    this.message = message;
    this.type = type;
    this.createdAt = LocalDateTime.now();
  }
}
