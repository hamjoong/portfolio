package com.hjuk.devcodehub.domain.chat.repository;

import com.hjuk.devcodehub.domain.chat.domain.ChatMessage;
import com.hjuk.devcodehub.domain.chat.domain.ChatRoom;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
  Page<ChatMessage> findByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom, Pageable pageable);

  long countByChatRoomAndCreatedAtAfter(ChatRoom chatRoom, LocalDateTime createdAt);

  @Query(
      "SELECT cm FROM ChatMessage cm JOIN FETCH cm.chatRoom "
          + "WHERE cm.id IN (SELECT MAX(m.id) FROM ChatMessage m "
          + "WHERE m.chatRoom.id IN :roomIds GROUP BY m.chatRoom.id)")
  List<ChatMessage> findLatestMessagesByRoomIds(@Param("roomIds") List<Long> roomIds);

  @Query(
      "SELECT cru.chatRoom.id, COUNT(cm) FROM ChatRoomUser cru "
          + "JOIN ChatMessage cm ON cru.chatRoom.id = cm.chatRoom.id "
          + "WHERE cru.user.id = :userId AND cm.id > COALESCE(cru.lastReadMessageId, 0) "
          + "GROUP BY cru.chatRoom.id")
  List<Object[]> countUnreadMessagesByUserId(@Param("userId") Long userId);

  void deleteByCreatedAtBefore(LocalDateTime expiryTime);
}
