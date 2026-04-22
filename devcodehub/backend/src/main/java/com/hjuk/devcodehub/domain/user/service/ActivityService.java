package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.BadgeRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ActivityService {

  private final UserRepository userRepository;
  private final BadgeRepository badgeRepository;

  @Transactional
  public void recordActivity(String loginId, int points) {
    log.info("활동 기록 시작: user={}, points={}",
                com.hjuk.devcodehub.global.util.MaskingUtil.maskLoginId(loginId), points);

    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(
                () ->
                    new com.hjuk.devcodehub.global.error.exception.BusinessException(
                        com.hjuk.devcodehub.global.error.exception.ErrorCode.USER_NOT_FOUND));

    user.addExperience(points);

    java.util.List<com.hjuk.devcodehub.domain.user.domain.Badge> allBadges =
        badgeRepository.findAll();
    java.util.Set<Long> ownedBadgeIds =
        user.getBadges().stream()
            .map(com.hjuk.devcodehub.domain.user.domain.Badge::getId)
            .collect(java.util.stream.Collectors.toSet());

    for (com.hjuk.devcodehub.domain.user.domain.Badge badge : allBadges) {
      if (!ownedBadgeIds.contains(badge.getId()) && isConditionMet(user, badge)) {
        log.info("뱃지 획득: user={}, badge={}",
                com.hjuk.devcodehub.global.util.MaskingUtil.maskLoginId(loginId), badge.getName());
        user.addBadge(badge);
      }
    }

    userRepository.save(user);
    log.info(
        "활동 기록 및 저장 완료: user={}, level={}, exp={}", loginId, user.getLevel(), user.getExperience());
  }

  private boolean isConditionMet(User user, com.hjuk.devcodehub.domain.user.domain.Badge badge) {
    return switch (badge.getConditionType()) {
      case XP -> user.getExperience() >= badge.getThreshold();
      case POST_COUNT -> true;
      default -> false;
    };
  }
}
