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

  @BeforeEach
  void setUp() {
    gemini = mock(AiProvider.class);
    when(gemini.getName()).thenReturn("gemini");

    aiReviewService =
        new AiReviewService(
            guestUsageRepository,
            userRepository,
            creditService,
            subscriptionService,
            subscriptionRepository,
            List.of(gemini),
            activityService,
            reviewHistoryService,
            syncExecutor);
  }

  @Test
  @DisplayName("무료 한도 소진 후 크레딧으로 리뷰 요청 시 정상 차감되어야 함")
  void testRequestAiReview_AfterFreeLimit() {
    String loginId = "user1";
    User user = User.builder().loginId(loginId).credits(1000).role(Role.USER).build();
    ReflectionTestUtils.setField(user, "maxWeeklyFreeLimit", 5);
    for (int i = 0; i < 5; i++) user.useFreeReview();

    when(userRepository.findByLoginId(loginId)).thenReturn(Optional.of(user));
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
}
