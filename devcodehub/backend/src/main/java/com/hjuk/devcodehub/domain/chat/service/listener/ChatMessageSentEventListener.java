package com.hjuk.devcodehub.domain.chat.service.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import com.hjuk.devcodehub.domain.chat.repository.ChatRoomUserRepository;
import com.hjuk.devcodehub.domain.chat.repository.ChatMessageRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.notification.event.ChatMessageSentEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatMessageSentEventListener {

  private final ChatRoomUserRepository chatRoomUserRepository;
  private final UserRepository userRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final SimpMessageSendingOperations messagingTemplate;

  @Async
  @EventListener
  public void handleMessageSent(ChatMessageSentEvent event) {
    try {
      var message = event.getMessage();
      var roomId = message.getRoomId();
      var senderLoginId = message.getSenderLoginId();

      for (var loginId : event.getParticipantLoginIds()) {
        if (loginId.equals(senderLoginId)) {
          continue;
        }

        Long userId = userRepository.findByLoginId(loginId)
            .map(com.hjuk.devcodehub.domain.user.domain.User::getId)
            .orElse(0L);

        Long unreadCount = chatMessageRepository.countUnreadMessagesByUserId(userId)
            .stream()
            .filter(row -> ((Long) row[0]).equals(roomId))
            .map(row -> (Long) row[1])
            .findFirst()
            .orElse(0L);

        messagingTemplate.convertAndSend("/sub/chat/unread/" + loginId,
            Map.of("roomId", roomId, "unreadCount", unreadCount));
      }
    } catch (Exception e) {
      log.error("Failed to update unread count via DB for message: {}", event.getMessage().getId(), e);
    }
  }
}
