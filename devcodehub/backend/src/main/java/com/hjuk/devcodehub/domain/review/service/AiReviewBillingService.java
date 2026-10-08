package com.hjuk.devcodehub.domain.review.service;

import com.hjuk.devcodehub.domain.review.domain.GuestUsage;
import com.hjuk.devcodehub.domain.review.repository.GuestUsageRepository;
import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.SubscriptionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.ActivityService;
import com.hjuk.devcodehub.domain.user.service.CreditService;
import com.hjuk.devcodehub.domain.user.service.SubscriptionService;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import com.hjuk.devcodehub.global.util.MaskingUtil;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * [Why] AI 리뷰의 '정산' 단계를 짧은 트랜잭션으로 분리한다. AI 호출은 수십 초가 걸릴 수 있어 그동안 DB 커넥션을 잡고 있으면
 * 풀이 금방 바닥나므로, 호출은 트랜잭션 밖에서 하고 성공한 건수만큼만 여기서 한 번에 차감한다.
 */
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AiReviewBillingService {

  private static final int REVIEW_COST_PER_MODEL = 10;
  private static final int XP_PER_SUCCESSFUL_REVIEW = 10;

  private final GuestUsageRepository guestUsageRepository;
  private final UserRepository userRepository;
  private final CreditService creditService;
  private final SubscriptionService subscriptionService;
  private final SubscriptionRepository subscriptionRepository;
  private final ActivityService activityService;

  /**
   * 성공한 리뷰 건수만큼 무료 한도 또는 크레딧을 차감하고 활동(XP)을 기록한다.
   *
   * @param loginId 회원 로그인 ID (비회원이면 null)
   * @param ipAddress 접속 IP (비회원 한도 집계용)
   * @param isGuest 비회원 여부
   * @param successCount 성공한 리뷰 건수
   */
  public void settle(String loginId, String ipAddress, boolean isGuest, int successCount) {
    if (isGuest) {
      updateGuestUsage(ipAddress);
      return;
    }

    // [Why] 잠금을 걸고 최신 상태를 읽어 동시에 들어온 요청이 같은 무료 한도를 중복 사용하지 못하게 한다.
    User author =
        userRepository
            .findByLoginIdForUpdate(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    int remaining = deductFreeReviews(author, successCount);
    if (remaining > 0) {
      creditService.spendCredits(
          loginId, remaining * REVIEW_COST_PER_MODEL, CreditTransactionType.SPEND_AI, null);
    }
    activityService.recordActivity(loginId, XP_PER_SUCCESSFUL_REVIEW * successCount);
  }

  private int deductFreeReviews(User author, int count) {
    int weeklyLimit = author.getMaxWeeklyFreeLimit();
    if (subscriptionService.isActive(author.getLoginId())) {
      var subscription =
          subscriptionRepository
              .findByUserLoginIdAndActiveTrue(author.getLoginId())
              .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
      weeklyLimit += subscriptionService.getPlanBenefits(subscription.getPlan()).get("aiLimit");
    }

    int freeRemaining = Math.max(0, weeklyLimit - author.getWeeklyFreeReviewUsed());
    int toDeduct = Math.min(count, freeRemaining);

    author.consumeFreeReviews(toDeduct);
    int remaining = count - toDeduct;
    log.info(
        "AI 리뷰 한도 차감 완료: user={}, freeUsed={}, paidCountRequired={}",
        MaskingUtil.maskLoginId(author.getLoginId()),
        toDeduct,
        remaining);
    return remaining;
  }

  private void updateGuestUsage(String ipAddress) {
    GuestUsage usage =
        guestUsageRepository
            .findByIpAddress(ipAddress)
            .orElseGet(
                () ->
                    guestUsageRepository.save(
                        GuestUsage.builder()
                            .ipAddress(ipAddress)
                            .usageCount(0)
                            .lastUsedAt(LocalDateTime.now())
                            .build()));
    usage.incrementUsage();
    guestUsageRepository.save(usage);
  }
}
