package com.hjuk.devcodehub.domain.chat.repository;

import com.hjuk.devcodehub.domain.chat.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
}
