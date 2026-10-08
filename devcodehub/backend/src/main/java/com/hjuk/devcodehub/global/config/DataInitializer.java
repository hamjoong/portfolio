package com.hjuk.devcodehub.global.config;

import com.hjuk.devcodehub.domain.user.domain.Badge;
import com.hjuk.devcodehub.domain.user.domain.BadgeConditionType;
import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.BadgeRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer {

  private static final int XP_BADGE_THRESHOLD = 2000;
  private static final int REVIEW_BADGE_THRESHOLD = 10;
  private static final int COMMENT_BADGE_THRESHOLD = 30;
  private static final int ADMIN_INITIAL_CREDITS = 999999;

  private final BadgeRepository badgeRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${ADMIN_ID}")
  private String adminId;

  @Value("${ADMIN_PASSWORD}")
  private String adminPassword;

  @EventListener(ContextRefreshedEvent.class)
  @Transactional
  public void init() {
    initBadges();
    initAdmin();
  }

  private void initBadges() {
    if (badgeRepository.count() == 0) {
      badgeRepository.save(
          Badge.builder()
              .name("FIRST_POST")
              .description("첫 게시글 작성")
              .conditionType(BadgeConditionType.POST_COUNT)
              .threshold(1)
              .build());
      badgeRepository.save(
          Badge.builder()
              .name("MASTER_DEV")
              .description("총 " + XP_BADGE_THRESHOLD + " XP 달성")
              .conditionType(BadgeConditionType.XP)
              .threshold(XP_BADGE_THRESHOLD)
              .build());
      badgeRepository.save(
          Badge.builder()
              .name("REVIEW_MASTER")
              .description("AI 리뷰 " + REVIEW_BADGE_THRESHOLD + "회 완료")
              .conditionType(BadgeConditionType.REVIEW_COUNT)
              .threshold(REVIEW_BADGE_THRESHOLD)
              .build());
      badgeRepository.save(
          Badge.builder()
              .name("COMMUNITY_KING")
              .description("댓글 " + COMMENT_BADGE_THRESHOLD + "회 작성")
              .conditionType(BadgeConditionType.COMMENT_COUNT)
              .threshold(COMMENT_BADGE_THRESHOLD)
              .build());
    }
  }

  private void initAdmin() {
    if (userRepository.findByLoginId(adminId).isEmpty()) {
      userRepository.save(
          User.builder()
              .loginId(adminId)
              .password(passwordEncoder.encode(adminPassword))
              .nickname("관리자")
              .email("admin@devcodehub.com")
              .role(Role.ADMIN)
              .credits(ADMIN_INITIAL_CREDITS)
              .build());
    }
  }
}
