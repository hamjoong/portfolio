package com.hjuk.devcodehub.domain.notification.scheduler;

import com.hjuk.devcodehub.domain.notification.repository.NotificationRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** [Why] 알림 데이터의 수명 주기(Retention Policy)를 관리하는 스케줄러입니다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

  private final NotificationRepository notificationRepository;
  private static final int EXPIRY_DAYS = 7;

  /** [Why] 주기적으로 7일이 지난 알림을 DB에서 삭제하여 데이터 최적화 및 보안 유지. 매일 새벽 3시에 실행. */
  @Scheduled(cron = "0 0 3 * * *")
  @Transactional
  public void deleteExpiredNotifications() {
    log.info("Starting cleanup of expired notifications (7 days old).");
    try {
      LocalDateTime expiryTime = LocalDateTime.now().minusDays(EXPIRY_DAYS);
      notificationRepository.deleteByCreatedAtBefore(expiryTime);
      log.info("Successfully deleted expired notifications older than {} days.", EXPIRY_DAYS);
    } catch (Exception e) {
      log.error("Failed to delete expired notifications: {}", e.getMessage());
    }
  }
}
