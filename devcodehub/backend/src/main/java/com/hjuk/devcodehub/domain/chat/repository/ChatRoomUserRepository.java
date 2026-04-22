package com.hjuk.devcodehub.domain.chat.repository;

import com.hjuk.devcodehub.domain.chat.domain.ChatRoom;
import com.hjuk.devcodehub.domain.chat.domain.ChatRoomUser;
import com.hjuk.devcodehub.domain.user.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomUserRepository extends JpaRepository<ChatRoomUser, Long> {
  List<ChatRoomUser> findByUser(User user);

  Optional<ChatRoomUser> findByChatRoomAndUser(ChatRoom chatRoom, User user);

  List<ChatRoomUser> findByChatRoom(ChatRoom chatRoom);

  List<ChatRoomUser> findByChatRoomId(Long chatRoomId);
}
