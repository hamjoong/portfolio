package com.hjuk.devcodehub.domain.chat.domain;

import com.hjuk.devcodehub.domain.user.domain.User;
import jakarta.persistence.Entity;
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

/** [Why] 채팅방과 사용자 간의 관계를 관리하는 도메인 엔티티입니다. */
@Entity
@Table(
    name = "chat_room_users",
    indexes = {
      @Index(name = "idx_user_chat_room", columnList = "user_id, chat_room_id")
    })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoomUser {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "chat_room_id", nullable = false)
  private ChatRoom chatRoom;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  private LocalDateTime lastReadAt;

  private Long lastReadMessageId;

  /**
   * [Why] 채팅방에 사용자를 참여시킵니다.
   *
   * @param chatRoom 참여할 채팅방
   * @param user     참여할 사용자
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public ChatRoomUser(ChatRoom chatRoom, User user) {
    this.chatRoom = chatRoom;
    this.user = user;
    this.lastReadAt = LocalDateTime.now();
    this.lastReadMessageId = 0L;
  }

  /** [Why] 마지막 메시지 읽은 시간을 업데이트합니다. */
  public void updateLastReadAt() {
    this.lastReadAt = LocalDateTime.now();
  }

  /**
   * [Why] 마지막으로 읽은 메시지 ID를 업데이트합니다.
   *
   * @param messageId 읽은 메시지 ID
   */
  public void updateLastReadMessageId(Long messageId) {
    this.lastReadMessageId = messageId;
  }
}
