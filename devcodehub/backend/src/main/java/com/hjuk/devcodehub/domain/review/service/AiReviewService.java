package com.hjuk.devcodehub.domain.review.service;

import com.hjuk.devcodehub.domain.review.domain.GuestUsage;
import com.hjuk.devcodehub.domain.review.dto.AiReviewRequest;
import com.hjuk.devcodehub.domain.review.repository.GuestUsageRepository;
import com.hjuk.devcodehub.domain.review.service.provider.AiProvider;
import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.SubscriptionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.CreditService;
import com.hjuk.devcodehub.domain.user.service.SubscriptionService;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AiReviewService {

  private final GuestUsageRepository guestUsageRepository;
  private final UserRepository userRepository;
  private final CreditService creditService;
  private final SubscriptionService subscriptionService;
  private final SubscriptionRepository subscriptionRepository;
  private final List<AiProvider> aiProviders;
  private final com.hjuk.devcodehub.domain.user.service.ActivityService activityService;
  private final ReviewHistoryService reviewHistoryService;

  @org.springframework.beans.factory.annotation.Qualifier("aiTaskExecutor")
  private final java.util.concurrent.Executor aiTaskExecutor;

  private static final int GUEST_MAX_REVIEWS = 3;
  private static final int GUEST_MAX_CODE_LINES = 100;
  private static final int REVIEW_COST_PER_MODEL = 10;
  private static final int XP_PER_SUCCESSFUL_REVIEW = 10;
  private static final String DEFAULT_AI_MODEL = "gemini";

  public int getGuestUsage(String ipAddress) {
    return guestUsageRepository.findByIpAddress(ipAddress).map(GuestUsage::getUsageCount).orElse(0);
  }

  public Map<String, Object> requestAiReview(
      AiReviewRequest request, String loginId, String ipAddress, boolean isGuest) {
    User author = checkPaymentAvailability(loginId, ipAddress, isGuest, request);

    List<String> requestedModels = getRequestedModels(request);
    Map<String, Object> combinedResults = executeAiReviews(request, author, requestedModels);

    long successCount = countSuccessfulReviews(combinedResults);

    if (successCount > 0) {
      processActualPayment(author, ipAddress, isGuest, (int) successCount);
      if (author != null) {
        activityService.recordActivity(author.getLoginId(), XP_PER_SUCCESSFUL_REVIEW * (int) successCount);
      }
    }

    return combinedResults;
  }

  private List<String> getRequestedModels(AiReviewRequest request) {
    return (request.getModels() == null || request.getModels().isEmpty())
        ? List.of(DEFAULT_AI_MODEL)
        : request.getModels();
  }

  private Map<String, Object> executeAiReviews(
      AiReviewRequest request, User author, List<String> requestedModels) {
    List<CompletableFuture<Map<String, Object>>> futures =
        aiProviders.stream()
            .filter(provider -> requestedModels.contains(provider.getName()))
            .map(
                provider ->
                    CompletableFuture.supplyAsync(
                            () -> {
                              Map<String, Object> result =
                                  provider.review(request.getCode(), request.getLanguage());
                              if (author != null && !result.containsKey("error")) {
                                reviewHistoryService.saveReview(
                                    request, provider.getName(), result, author);
                              }
                              return Map.<String, Object>of(provider.getName(), result);
                            },
                            aiTaskExecutor)
                        .exceptionally(
                            ex -> {
                              log.error(
                                  "AI Provider {} failed: {}", provider.getName(), ex.getMessage());
                              return Map.of(
                                  provider.getName(), Map.of("error", "연동 오류: " + ex.getMessage()));
                            }))
            .toList();

    return futures.stream()
        .map(CompletableFuture::join)
        .flatMap(m -> m.entrySet().stream())
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  private long countSuccessfulReviews(Map<String, Object> results) {
    return results.values().stream()
        .filter(val -> val instanceof Map && !((Map<?, ?>) val).containsKey("error"))
        .count();
  }

  private User checkPaymentAvailability(
      String loginId, String ipAddress, boolean isGuest, AiReviewRequest request) {
    if (isGuest) {
      validateGuestUsage(ipAddress);
      validateCodeQuality(request.getCode());
      return null;
    }

    if (loginId == null) {
      throw new BusinessException(ErrorCode.USER_NOT_FOUND);
    }

    User author =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    // [Why] 사용자의 기본 한도(지출 보너스 포함)와 구독 플랜 혜택을 합산하여 정확한 주간 무료 한도 계산
    int weeklyLimit = author.getMaxWeeklyFreeLimit();
    if (subscriptionService.isActive(loginId)) {
      var subscription =
          subscriptionRepository
              .findByUserLoginIdAndActiveTrue(loginId)
              .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
      weeklyLimit += subscriptionService.getPlanBenefits(subscription.getPlan()).get("aiLimit");
    }

    int freeRemaining = Math.max(0, weeklyLimit - author.getWeeklyFreeReviewUsed());
    int requestedCount = (request.getModels() != null ? request.getModels().size() : 1);

    // 무료 한도 초과분만큼 크레딧 차감 필요
    int paidCountRequired = Math.max(0, requestedCount - freeRemaining);
    int totalCost = paidCountRequired * REVIEW_COST_PER_MODEL;

    if (author.getCredits() < totalCost) {
      throw new BusinessException(
          "크레딧이 부족합니다. (필요: " + totalCost + ", 보유: " + author.getCredits() + ")",
          ErrorCode.HANDLE_ACCESS_DENIED);
    }

    return author;
  }

  private void processActualPayment(
      User author, String ipAddress, boolean isGuest, int successCount) {
    if (isGuest) {
      updateGuestUsage(ipAddress);
      return;
    }

    int remaining = deductFreeReviews(author, successCount);

    if (remaining > 0) {
      creditService.spendCredits(
          author.getLoginId(),
          remaining * REVIEW_COST_PER_MODEL,
          CreditTransactionType.SPEND_AI,
          null);
    }

    userRepository.save(author);
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

    for (int i = 0; i < toDeduct; i++) {
      author.useFreeReview();
    }
    int remaining = count - toDeduct;
    log.info(
        "AI 리뷰 한도 차감 완료: user={}, freeUsed={}, paidCountRequired={}",
        com.hjuk.devcodehub.global.util.MaskingUtil.maskLoginId(author.getLoginId()),
        toDeduct,
        remaining);
    return remaining;
  }

  private void validateGuestUsage(String ipAddress) {
    if (ipAddress == null || ipAddress.isBlank()) {
      throw new BusinessException("접속 정보를 확인할 수 없습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
    GuestUsage usage =
        guestUsageRepository
            .findByIpAddress(ipAddress)
            .orElse(
                GuestUsage.builder()
                    .ipAddress(ipAddress)
                    .usageCount(0)
                    .lastUsedAt(LocalDateTime.now())
                    .build());
    if (usage.getUsageCount() >= GUEST_MAX_REVIEWS) {
      throw new BusinessException("비회원 리뷰 한도를 모두 소진하셨습니다.", ErrorCode.HANDLE_ACCESS_DENIED);
    }
  }

  private void validateCodeQuality(String code) {
    if (code == null || code.trim().isEmpty()) {
      throw new BusinessException("리뷰할 코드를 입력해 주세요.", ErrorCode.INVALID_INPUT_VALUE);
    }
    if (code.split("\n").length > GUEST_MAX_CODE_LINES) {
      throw new BusinessException(
          "비회원은 한 번에 100줄 이상의 코드를 리뷰할 수 없습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
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
