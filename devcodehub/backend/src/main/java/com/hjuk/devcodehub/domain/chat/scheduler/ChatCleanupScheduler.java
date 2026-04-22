package com.hjuk.devcodehub.domain.chat.scheduler;

import com.hjuk.devcodehub.domain.chat.repository.ChatMessageRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** [Why] 주기적으로 3개월(90일)이 지난 채팅 메시지를 DB에서 삭제하여 데이터 최적화 및 보안 유지. */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatCleanupScheduler {

  private final ChatMessageRepository chatMessageRepository;
  private static final int EXPIRY_DAYS = 90; // 약 3개월

  /** [Why] 매일 새벽 4시에 90일이 지난 채팅 메시지를 Hard Delete 방식으로 삭제합니다. */
  @Scheduled(cron = "0 0 4 * * *")
  @Transactional
  public void deleteExpiredChatMessages() {
    log.info("Starting cleanup of expired chat messages (90 days old).");
    try {
      LocalDateTime expiryTime = LocalDateTime.now().minusDays(EXPIRY_DAYS);
      chatMessageRepository.deleteByCreatedAtBefore(expiryTime);
      log.info("Successfully deleted expired chat messages older than {} days.", EXPIRY_DAYS);
    } catch (Exception e) {
      log.error("Failed to delete expired chat messages: {}", e.getMessage());
    }
  }
}
