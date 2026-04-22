package com.hjuk.devcodehub.domain.chat.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** [Why] 채팅방 정보를 관리하는 도메인 엔티티입니다. */
@Entity
@Table(name = "chat_rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom {
  private static final int BATCH_SIZE = 50;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ChatRoomType type;

  private LocalDateTime createdAt;

  @org.hibernate.annotations.BatchSize(size = BATCH_SIZE)
  @OneToMany(
      mappedBy = "chatRoom",
      cascade = jakarta.persistence.CascadeType.ALL,
      orphanRemoval = true)
  private List<ChatRoomUser> participants = new ArrayList<>();

  /**
   * [Why] 새로운 채팅방을 생성합니다.
   *
   * @param name 채팅방 이름
   * @param type 채팅방 타입
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public ChatRoom(String name, ChatRoomType type) {
    this.name = name;
    this.type = type;
    this.createdAt = LocalDateTime.now();
  }
}
