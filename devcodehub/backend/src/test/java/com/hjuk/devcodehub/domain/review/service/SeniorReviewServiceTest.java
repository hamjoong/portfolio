package com.hjuk.devcodehub.domain.review.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hjuk.devcodehub.domain.review.domain.SeniorReviewApplication;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewRequest;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewStatus;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewApplicationRepository;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewRepository;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewRequestRepository;
import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.ActivityService;
import com.hjuk.devcodehub.domain.user.service.CreditService;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class SeniorReviewServiceTest {

  @Mock private SeniorReviewRequestRepository requestRepository;
  @Mock private SeniorReviewApplicationRepository applicationRepository;
  @Mock private SeniorReviewRepository reviewRepository;
  @Mock private UserRepository userRepository;
  @Mock private CreditService creditService;
  @Mock private ActivityService activityService;
  @Mock private ApplicationEventPublisher eventPublisher;

  private SeniorReviewService service;
  private User junior;
  private User senior;
  private SeniorReviewRequest request;

  @BeforeEach
  void setUp() {
    service =
        new SeniorReviewService(
            requestRepository,
            applicationRepository,
            reviewRepository,
            userRepository,
            creditService,
            activityService,
            eventPublisher);
    junior = User.builder().loginId("junior").nickname("j").role(Role.USER).build();
    senior = User.builder().loginId("senior").nickname("s").role(Role.SENIOR).build();
    request =
        SeniorReviewRequest.builder().junior(junior).title("t").content("c").credits(1000).build();
    ReflectionTestUtils.setField(request, "id", 1L);
  }

  @Test
  @DisplayName("이미 매칭·완료된 요청은 다시 매칭할 수 없다 (정산 반복 방지)")
  void accept_notPendingRejected() {
    request.matchWithSenior(senior);
    when(requestRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(request));

    assertThrows(BusinessException.class, () -> service.acceptApplication(1L, 10L, "junior"));
  }

  @Test
  @DisplayName("요청 작성자가 아니면 매칭할 수 없다")
  void accept_onlyOwner() {
    when(requestRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(request));

    assertThrows(BusinessException.class, () -> service.acceptApplication(1L, 10L, "intruder"));
  }

  @Test
  @DisplayName("다른 요청의 지원서 ID로는 매칭할 수 없다")
  void accept_applicationOfOtherRequest() {
    SeniorReviewRequest other =
        SeniorReviewRequest.builder().junior(junior).title("o").content("c").credits(500).build();
    ReflectionTestUtils.setField(other, "id", 2L);
    SeniorReviewApplication foreign =
        SeniorReviewApplication.builder().request(other).senior(senior).message("hi").build();

    when(requestRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(request));
    when(applicationRepository.findById(10L)).thenReturn(Optional.of(foreign));

    assertThrows(BusinessException.class, () -> service.acceptApplication(1L, 10L, "junior"));
    assertEquals(SeniorReviewStatus.PENDING, request.getStatus());
  }

  @Test
  @DisplayName("이미 완료된 리뷰는 다시 완료·정산할 수 없다 (이중 지급 방지)")
  void complete_onlyOnce() {
    request.matchWithSenior(senior);
    request.completeReview();
    when(requestRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(request));

    assertThrows(BusinessException.class, () -> service.completeReview(1L, "senior", "again"));

    verify(creditService, never()).earnCredits(anyString(), anyInt(), any(), any());
  }

  @Test
  @DisplayName("지원자 목록은 요청 작성자(또는 관리자)만 볼 수 있다")
  void applications_ownerOnly() {
    when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
    when(userRepository.findByLoginId("stranger"))
        .thenReturn(Optional.of(User.builder().loginId("stranger").role(Role.USER).build()));

    assertThrows(BusinessException.class, () -> service.getApplications(1L, "stranger"));
  }

  @Test
  @DisplayName("리뷰 결과는 요청자·담당 시니어·관리자 외에는 볼 수 없다")
  void result_accessControlled() {
    request.matchWithSenior(senior);
    when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
    when(userRepository.findByLoginId("stranger"))
        .thenReturn(Optional.of(User.builder().loginId("stranger").role(Role.USER).build()));

    assertThrows(BusinessException.class, () -> service.getReviewResult(1L, "stranger"));
  }
}
