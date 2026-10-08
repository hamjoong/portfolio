package com.hjuk.devcodehub.domain.user.scheduler;

import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserLimitScheduler {

  private final UserRepository userRepository;

  /** [원복] 매주 월요일 00시 00분에 실행. */
  @Scheduled(cron = "0 0 0 * * MON")
  @Transactional
  public void resetWeeklyFreeLimits() {
    log.info("Starting weekly free review limit reset for all users.");
    try {
      int updatedCount = userRepository.resetAllWeeklyFreeReviewUsed();
      log.info("Successfully reset weekly limits for {} users.", updatedCount);
    } catch (Exception e) {
      log.error("Failed to reset weekly free limits: {}", e.getMessage());
    }
  }
}
