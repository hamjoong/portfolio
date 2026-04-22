package com.hjuk.devcodehub.domain.chat.scheduler;

import com.hjuk.devcodehub.domain.chat.domain.ChatMessage;
import com.hjuk.devcodehub.domain.chat.domain.ChatRoom;
import com.hjuk.devcodehub.domain.chat.dto.ChatMessageRequest;
import com.hjuk.devcodehub.domain.chat.repository.ChatMessageRepository;
import com.hjuk.devcodehub.domain.chat.repository.ChatRoomRepository;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    name = "app.redis.auto-startup",
    havingValue = "true",
    matchIfMissing = true)
public class ChatWriteBehindScheduler {

  private final RedisTemplate<String, Object> redisTemplate;
  private final ChatMessageRepository chatMessageRepository;
  private final ChatRoomRepository chatRoomRepository;
  private final UserRepository userRepository;

  private static final String CHAT_QUEUE_KEY = "chat:message:queue";
  private static final int FLUSH_INTERVAL = 300000;

  /**
   * [Why] - Write-behind 전략 구현: Redis에 임시 저장된 채팅 메시지들을 주기적으로 DB에 일괄 저장함. - 성능 최적화: 메시지 발생 시마다 DB
   * IO를 발생시키지 않고 Batch Insert를 통해 부하를 줄임. - 안정성 확보: Redis 연결 실패 시 스케줄러가 중단되지 않도록 예외 처리를 추가함.
   */
  @Scheduled(fixedDelay = FLUSH_INTERVAL) // 5분마다 실행
  public void flushChatMessages() {
    try {
      Long queueSize = redisTemplate.opsForList().size(CHAT_QUEUE_KEY);
      if (queueSize == null || queueSize == 0) {
        return;
      }

      log.info("Starting Chat Write-behind flush. Messages to process: {}", queueSize);

      List<ChatMessageRequest> requests = new java.util.ArrayList<>();
      List<Object> rawMessages = redisTemplate.opsForList().range(CHAT_QUEUE_KEY, 0, queueSize - 1);

      if (rawMessages != null) {
        for (Object obj : rawMessages) {
          if (obj instanceof ChatMessageRequest) {
            requests.add((ChatMessageRequest) obj);
          }
        }
      }

      redisTemplate.opsForList().trim(CHAT_QUEUE_KEY, queueSize, -1);

      if (requests.isEmpty()) {
        return;
      }

      saveMessagesToDb(requests);
    } catch (Exception e) {
      log.error("Redis connection failed during Chat Write-behind flush: {}", e.getMessage());
    }
  }

  // [Why] 트랜잭션 범위를 메서드 단위로 좁혀 DB 효율성 증대
  @Transactional
  protected void saveMessagesToDb(List<ChatMessageRequest> requests) {
    // [Why] N+1 문제 해결을 위한 Bulk Fetch 전략
    java.util.Set<Long> roomIds =
        requests.stream()
            .map(ChatMessageRequest::getRoomId)
            .collect(java.util.stream.Collectors.toSet());
    java.util.Set<String> loginIds =
        requests.stream()
            .map(ChatMessageRequest::getSenderLoginId)
            .collect(java.util.stream.Collectors.toSet());

    java.util.Map<Long, ChatRoom> roomMap =
        chatRoomRepository.findAllById(roomIds).stream()
            .collect(java.util.stream.Collectors.toMap(ChatRoom::getId, r -> r));
    java.util.Map<String, User> userMap =
        userRepository.findByLoginIdIn(loginIds).stream()
            .collect(java.util.stream.Collectors.toMap(User::getLoginId, u -> u));

    List<ChatMessage> messagesToSave =
        requests.stream()
            .map(
                req -> {
                  ChatRoom room = roomMap.get(req.getRoomId());
                  User sender = userMap.get(req.getSenderLoginId());
                  if (room != null && sender != null) {
                    return ChatMessage.builder()
                        .chatRoom(room)
                        .sender(sender)
                        .message(req.getMessage())
                        .type(req.getType())
                        .build();
                  }
                  return null;
                })
            .filter(java.util.Objects::nonNull)
            .collect(java.util.stream.Collectors.toList());

    if (!messagesToSave.isEmpty()) {
      chatMessageRepository.saveAll(messagesToSave);
      log.info("Successfully flushed {} chat messages to DB.", messagesToSave.size());
    }
  }
}
