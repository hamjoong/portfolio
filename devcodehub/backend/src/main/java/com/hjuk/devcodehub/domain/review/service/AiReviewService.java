package com.hjuk.devcodehub.domain.review.service;

import com.hjuk.devcodehub.domain.review.domain.GuestUsage;
import com.hjuk.devcodehub.domain.review.dto.AiReviewRequest;
import com.hjuk.devcodehub.domain.review.repository.GuestUsageRepository;
import com.hjuk.devcodehub.domain.review.service.provider.AiProvider;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.SubscriptionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class AiReviewService {

  private final GuestUsageRepository guestUsageRepository;
  private final UserRepository userRepository;
  private final AiReviewBillingService billingService;
  private final SubscriptionService subscriptionService;
  private final SubscriptionRepository subscriptionRepository;
  private final List<AiProvider> aiProviders;
  private final ReviewHistoryService reviewHistoryService;

  @org.springframework.beans.factory.annotation.Qualifier("aiTaskExecutor")
  private final java.util.concurrent.Executor aiTaskExecutor;

  private static final int GUEST_MAX_REVIEWS = 3;
  private static final int GUEST_MAX_CODE_LINES = 100;
  private static final int REVIEW_COST_PER_MODEL = 10;
  private static final long AI_CALL_TIMEOUT_SECONDS = 90;
  private static final String DEFAULT_AI_MODEL = "gemini";

  public int getGuestUsage(String ipAddress) {
    return guestUsageRepository.findByIpAddress(ipAddress).map(GuestUsage::getUsageCount).orElse(0);
  }

  /**
   * [Why] 화면이 키가 등록된 모델만 활성화할 수 있도록 모델별 사용 가능 여부를 돌려줍니다.
   *
   * @return 모델 이름 → 사용 가능 여부 (등록 순서 유지)
   */
  public Map<String, Boolean> getModelAvailability() {
    Map<String, Boolean> result = new java.util.LinkedHashMap<>();
    aiProviders.forEach(provider -> result.put(provider.getName(), provider.isAvailable()));
    return result;
  }

  public Map<String, Object> requestAiReview(
      AiReviewRequest request, String loginId, String ipAddress, boolean isGuest) {
    // [Why] 키가 없는 모델은 AI 호출·크레딧 차감 전에 먼저 거절한다.
    List<String> requestedModels = getRequestedModels(request);
    requireAvailableModels(requestedModels);
    request.setModels(requestedModels);

    User author = checkPaymentAvailability(loginId, ipAddress, isGuest, request);

    Map<String, Object> combinedResults = executeAiReviews(request, author, requestedModels);

    long successCount = countSuccessfulReviews(combinedResults);

    // [Why] AI 호출이 끝난 뒤, 성공한 건수만큼만 짧은 트랜잭션으로 정산한다.
    if (successCount > 0) {
      billingService.settle(loginId, ipAddress, isGuest, (int) successCount);
    }

    return combinedResults;
  }

  private List<String> getRequestedModels(AiReviewRequest request) {
    return (request.getModels() == null || request.getModels().isEmpty())
        ? List.of(DEFAULT_AI_MODEL)
        : request.getModels().stream().distinct().toList();
  }

  private void requireAvailableModels(List<String> requestedModels) {
    Map<String, Boolean> availability = getModelAvailability();
    for (String model : requestedModels) {
      Boolean available = availability.get(model);
      if (available == null) {
        throw new BusinessException("지원하지 않는 AI 모델입니다: " + model, ErrorCode.INVALID_INPUT_VALUE);
      }
      if (!available) {
        throw new BusinessException(
            "현재 사용할 수 없는 모델입니다 (API 키 미등록): " + model, ErrorCode.INVALID_INPUT_VALUE);
      }
    }
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
                        // [Why] 외부 AI가 멈춰도 요청 스레드가 영원히 기다리지 않도록 상한을 둔다.
                        .orTimeout(AI_CALL_TIMEOUT_SECONDS, java.util.concurrent.TimeUnit.SECONDS)
                        .exceptionally(
                            ex -> {
                              log.error(
                                  "AI Provider {} failed: {}", provider.getName(), ex.getMessage());
                              return Map.of(
                                  provider.getName(), Map.of("error", "AI 연동 중 오류가 발생했습니다."));
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
}
