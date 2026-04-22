package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.SubscriptionPlan;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.domain.UserSubscription;
import com.hjuk.devcodehub.domain.user.repository.SubscriptionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** [Why] 사용자의 구독 플랜 관리 및 혜택 조회, 환불 처리를 담당합니다. */
@Service
@Transactional
@RequiredArgsConstructor
public class SubscriptionService {

  private static final int WEEKLY_AI_LIMIT = 10;
  private static final int WEEKLY_REPORT_LIMIT = 1;
  private static final int MONTHLY_AI_LIMIT = 30;
  private static final int MONTHLY_REPORT_LIMIT = 999;
  private static final int YEARLY_AI_LIMIT = 100;
  private static final int YEARLY_REPORT_LIMIT = 999;
  private static final int WEEKLY_PRICE = 3000;
  private static final int MONTHLY_PRICE = 9900;
  private static final int YEARLY_PRICE = 99000;

  private final SubscriptionRepository subscriptionRepository;
  private final UserRepository userRepository;
  private final CreditService creditService;

  /**
   * [Why] 사용자의 구독을 처리합니다.
   *
   * @param inputLoginId 구독할 사용자 ID
   * @param inputPlan 구독 플랜
   */
  public void subscribe(String inputLoginId, SubscriptionPlan inputPlan) {
    User user =
        userRepository
            .findByLoginId(inputLoginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    subscriptionRepository
        .findByUserLoginIdAndActiveTrue(inputLoginId)
        .ifPresent(subscriptionRepository::delete);

    LocalDateTime now = LocalDateTime.now();
    LocalDateTime expiry =
        now.plusWeeks(inputPlan == SubscriptionPlan.WEEKLY ? 1 : 0)
            .plusMonths(inputPlan == SubscriptionPlan.MONTHLY ? 1 : 0)
            .plusYears(inputPlan == SubscriptionPlan.YEARLY ? 1 : 0);

    subscriptionRepository.save(
        UserSubscription.builder()
            .user(user)
            .plan(inputPlan)
            .startedAt(now)
            .expiredAt(expiry)
            .build());
  }

  /**
   * [Why] 플랜별 혜택을 조회합니다.
   *
   * @param inputPlan 구독 플랜
   * @return 플랜별 혜택 정보
   */
  @Transactional(readOnly = true)
  public Map<String, Integer> getPlanBenefits(SubscriptionPlan inputPlan) {
    return switch (inputPlan) {
      case WEEKLY -> Map.of("aiLimit", WEEKLY_AI_LIMIT, "reportLimit", WEEKLY_REPORT_LIMIT);
      case MONTHLY -> Map.of("aiLimit", MONTHLY_AI_LIMIT, "reportLimit", MONTHLY_REPORT_LIMIT);
      case YEARLY -> Map.of("aiLimit", YEARLY_AI_LIMIT, "reportLimit", YEARLY_REPORT_LIMIT);
    };
  }

  /**
   * [Why] 구독 활성 여부를 확인합니다.
   *
   * @param inputLoginId 사용자 ID
   * @return 구독 활성 여부
   */
  @Transactional(readOnly = true)
  public boolean isActive(String inputLoginId) {
    return subscriptionRepository.findByUserLoginIdAndActiveTrue(inputLoginId).isPresent();
  }

  /**
   * [Why] 구독을 취소하고 남은 기간만큼 크레딧을 환불합니다.
   *
   * @param inputLoginId 사용자 ID
   */
  public void unsubscribe(String inputLoginId) {
    UserSubscription subscription =
        subscriptionRepository
            .findByUserLoginIdAndActiveTrue(inputLoginId)
            .orElseThrow(() -> new BusinessException("활성화된 구독이 없습니다.", ErrorCode.ENTITY_NOT_FOUND));

    long totalDays =
        java.time.temporal.ChronoUnit.DAYS.between(
            subscription.getStartedAt(), subscription.getExpiredAt());
    long remainingDays =
        java.time.temporal.ChronoUnit.DAYS.between(
            LocalDateTime.now(), subscription.getExpiredAt());

    if (remainingDays > 0 && totalDays > 0) {
      int price =
          switch (subscription.getPlan()) {
            case WEEKLY -> WEEKLY_PRICE;
            case MONTHLY -> MONTHLY_PRICE;
            case YEARLY -> YEARLY_PRICE;
          };
      int refund = (int) (price * ((double) remainingDays / totalDays));
      creditService.earnCredits(inputLoginId, refund, CreditTransactionType.RECHARGE, null);
    }

    subscriptionRepository.delete(subscription);
  }
}
