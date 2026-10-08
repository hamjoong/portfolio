package com.hjuk.devcodehub.domain.review.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.hjuk.devcodehub.domain.review.dto.AiReviewRequest;
import com.hjuk.devcodehub.domain.review.repository.GuestUsageRepository;
import com.hjuk.devcodehub.domain.review.service.provider.AiProvider;
import com.hjuk.devcodehub.domain.user.domain.*;
import com.hjuk.devcodehub.domain.user.repository.SubscriptionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.CreditService;
import com.hjuk.devcodehub.domain.user.service.SubscriptionService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Executor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
public class AiReviewServiceTest {

  @Mock private GuestUsageRepository guestUsageRepository;
  @Mock private UserRepository userRepository;
  @Mock private CreditService creditService;
  @Mock private SubscriptionService subscriptionService;
  @Mock private SubscriptionRepository subscriptionRepository;
  @Mock private com.hjuk.devcodehub.domain.user.service.ActivityService activityService;
  @Mock private ReviewHistoryService reviewHistoryService;

  private AiReviewService aiReviewService;
  private final Executor syncExecutor = Runnable::run;
  private AiProvider gemini;
  private AiProvider claude;

  @BeforeEach
  void setUp() {
    gemini = mock(AiProvider.class);
    when(gemini.getName()).thenReturn("gemini");
    when(gemini.isAvailable()).thenReturn(true);
    claude = mock(AiProvider.class);
    when(claude.getName()).thenReturn("claude");
    when(claude.isAvailable()).thenReturn(false);

    aiReviewService =
        new AiReviewService(
            guestUsageRepository,
            userRepository,
            new AiReviewBillingService(
                guestUsageRepository,
                userRepository,
                creditService,
                subscriptionService,
                subscriptionRepository,
                activityService),
            subscriptionService,
            subscriptionRepository,
            List.of(gemini, claude),
            reviewHistoryService,
            syncExecutor);
  }

  @Test
  @DisplayName("무료 한도 소진 후 크레딧으로 리뷰 요청 시 정상 차감되어야 함")
  void testRequestAiReview_AfterFreeLimit() {
    String loginId = "user1";
    User user = User.builder().loginId(loginId).credits(1000).role(Role.USER).build();
    ReflectionTestUtils.setField(user, "maxWeeklyFreeLimit", 5);
    user.consumeFreeReviews(5);

    when(userRepository.findByLoginId(loginId)).thenReturn(Optional.of(user));
    when(userRepository.findByLoginIdForUpdate(loginId)).thenReturn(Optional.of(user));
    when(subscriptionService.isActive(loginId)).thenReturn(false);
    when(gemini.review(anyString(), anyString()))
        .thenReturn(Map.of("summary", "test", "rating", 80));

    AiReviewRequest request = new AiReviewRequest();
    request.setCode("code");
    request.setLanguage("java");
    request.setModels(List.of("gemini"));

    aiReviewService.requestAiReview(request, loginId, "127.0.0.1", false);

    verify(creditService, times(1))
        .spendCredits(eq(loginId), eq(10), eq(CreditTransactionType.SPEND_AI), isNull());
  }

  @Test
  @DisplayName("구독 혜택 포함 무료 한도 내에서는 크레딧이 차감되지 않아야 함")
  void testRequestAiReview_WithinSubscriptionLimit() {
    String loginId = "premiumUser";
    User user = User.builder().loginId(loginId).credits(1000).role(Role.USER).build();
    ReflectionTestUtils.setField(user, "maxWeeklyFreeLimit", 5);

    when(userRepository.findByLoginId(loginId)).thenReturn(Optional.of(user));
    when(userRepository.findByLoginIdForUpdate(loginId)).thenReturn(Optional.of(user));
    when(subscriptionService.isActive(loginId)).thenReturn(true);
    when(subscriptionRepository.findByUserLoginIdAndActiveTrue(loginId))
        .thenReturn(Optional.of(UserSubscription.builder().plan(SubscriptionPlan.MONTHLY).build()));
    when(subscriptionService.getPlanBenefits(SubscriptionPlan.MONTHLY))
        .thenReturn(Map.of("aiLimit", 30));
    when(gemini.review(anyString(), anyString()))
        .thenReturn(Map.of("summary", "test", "rating", 80));

    AiReviewRequest request = new AiReviewRequest();
    request.setCode("code");
    request.setLanguage("java");
    request.setModels(List.of("gemini"));

    aiReviewService.requestAiReview(request, loginId, "127.0.0.1", false);

    verify(creditService, never()).spendCredits(anyString(), anyInt(), any(), any());
  }

  @Test
  @DisplayName("API 키가 없는 모델을 요청하면 AI 호출·크레딧 차감 없이 거절되어야 함")
  void testRequestAiReview_UnavailableModelRejectedBeforeCharge() {
    AiReviewRequest request = new AiReviewRequest();
    request.setCode("code");
    request.setLanguage("java");
    request.setModels(List.of("gemini", "claude"));

    org.junit.jupiter.api.Assertions.assertThrows(
        com.hjuk.devcodehub.global.error.exception.BusinessException.class,
        () -> aiReviewService.requestAiReview(request, "user1", "127.0.0.1", false));

    verify(gemini, never()).review(anyString(), anyString());
    verify(creditService, never()).spendCredits(anyString(), anyInt(), any(), any());
  }

  @Test
  @DisplayName("모델 가용 여부 조회는 키가 등록된 모델만 true여야 함")
  void testGetModelAvailability() {
    Map<String, Boolean> availability = aiReviewService.getModelAvailability();

    org.junit.jupiter.api.Assertions.assertEquals(true, availability.get("gemini"));
    org.junit.jupiter.api.Assertions.assertEquals(false, availability.get("claude"));
  }
}
