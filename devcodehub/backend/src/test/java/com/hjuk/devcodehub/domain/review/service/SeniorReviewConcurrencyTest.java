package com.hjuk.devcodehub.domain.review.service;

import static com.hjuk.devcodehub.global.testsupport.ConcurrencyRunner.runConcurrently;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.hjuk.devcodehub.domain.review.domain.SeniorReviewApplication;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewRequest;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewStatus;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewApplicationRepository;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewRepository;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewRequestRepository;
import com.hjuk.devcodehub.domain.user.domain.CreditTransaction;
import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.ActivityService;
import com.hjuk.devcodehub.domain.user.service.CreditService;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * [Why] 시니어 매칭·정산이 요청 행 잠금(findByIdForUpdate)과 상태 검사로 직렬화되어, 같은 요청이 동시에 두 번 매칭되거나 두 번 정산되지
 * 않는지 실제 PostgreSQL에서 확인한다. Docker가 필요하다.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@Import({SeniorReviewService.class, CreditService.class, ActivityService.class})
@Testcontainers
// [Why] 클래스 전체를 하나의 트랜잭션으로 감싸면 스레드마다 별도 트랜잭션이 생기지 않아 동시성을 볼 수 없다.
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class SeniorReviewConcurrencyTest {

  private static final String JUNIOR = "junior";
  private static final String SENIOR = "senior";
  private static final String OTHER_SENIOR = "senior2";
  private static final int REQUEST_CREDITS = 1000;
  private static final int THREADS = 8;

  @Container @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

  @Autowired private SeniorReviewService seniorReviewService;
  @Autowired private UserRepository userRepository;
  @Autowired private SeniorReviewRequestRepository requestRepository;
  @Autowired private SeniorReviewApplicationRepository applicationRepository;
  @Autowired private SeniorReviewRepository reviewRepository;
  @Autowired private CreditTransactionRepository transactionRepository;

  @AfterEach
  void cleanUp() {
    transactionRepository.deleteAll();
    reviewRepository.deleteAll();
    applicationRepository.deleteAll();
    requestRepository.deleteAll();
    userRepository.deleteAll();
  }

  private User createUser(String loginId, Role role, int credits) {
    return userRepository.save(
        User.builder()
            .loginId(loginId)
            .nickname(loginId)
            .email(loginId + "@example.com")
            .role(role)
            .credits(credits)
            .build());
  }

  private SeniorReviewRequest createRequest(User junior) {
    return requestRepository.save(
        SeniorReviewRequest.builder()
            .junior(junior)
            .title("review me")
            .content("content")
            .codeContent("code")
            .language("java")
            .credits(REQUEST_CREDITS)
            .build());
  }

  @Test
  @DisplayName("같은 요청의 리뷰 완료가 동시에 들어와도 정산은 한 번만 되고 수수료 10%가 빠진다")
  void completeReview_concurrent_settledOnce() throws Exception {
    User junior = createUser(JUNIOR, Role.USER, 0);
    User senior = createUser(SENIOR, Role.SENIOR, 0);
    SeniorReviewRequest request = createRequest(junior);
    request.matchWithSenior(senior);
    requestRepository.save(request);
    Long requestId = request.getId();

    List<Throwable> results =
        runConcurrently(
            THREADS,
            () -> {
              seniorReviewService.completeReview(requestId, SENIOR, "good review");
              return null;
            });

    assertEquals(1, results.stream().filter(r -> r == null).count(), "성공은 정확히 한 건");
    assertTrue(
        results.stream().filter(r -> r != null).allMatch(r -> r instanceof BusinessException),
        "나머지는 상태 검사(BusinessException)로 거절되어야 한다");

    assertEquals(1, reviewRepository.count(), "리뷰는 한 건만 저장된다");
    assertEquals(
        SeniorReviewStatus.COMPLETED, requestRepository.findById(requestId).orElseThrow().getStatus());
    assertEquals(
        REQUEST_CREDITS - REQUEST_CREDITS / 10,
        userRepository.findByLoginId(SENIOR).orElseThrow().getCredits(),
        "시니어는 수수료를 뺀 금액을 한 번만 받는다");

    List<CreditTransaction> transactions = transactionRepository.findAll();
    assertEquals(
        1, transactions.stream().filter(t -> t.getType() == CreditTransactionType.EARN_REVIEW).count());
    assertEquals(
        1, transactions.stream().filter(t -> t.getType() == CreditTransactionType.COMMISSION).count());
  }

  @Test
  @DisplayName("서로 다른 시니어 지원을 동시에 수락해도 매칭은 한 번만 된다")
  void acceptApplication_concurrent_matchedOnce() throws Exception {
    User junior = createUser(JUNIOR, Role.USER, 0);
    User senior = createUser(SENIOR, Role.SENIOR, 0);
    User otherSenior = createUser(OTHER_SENIOR, Role.SENIOR, 0);
    SeniorReviewRequest request = createRequest(junior);
    Long requestId = request.getId();
    SeniorReviewApplication first =
        applicationRepository.save(
            SeniorReviewApplication.builder().request(request).senior(senior).message("me").build());
    SeniorReviewApplication second =
        applicationRepository.save(
            SeniorReviewApplication.builder()
                .request(request)
                .senior(otherSenior)
                .message("me too")
                .build());
    List<Long> applicationIds = List.of(first.getId(), second.getId());
    AtomicInteger counter = new AtomicInteger();

    List<Throwable> results =
        runConcurrently(
            2,
            () -> {
              Long applicationId = applicationIds.get(counter.getAndIncrement() % 2);
              seniorReviewService.acceptApplication(requestId, applicationId, JUNIOR);
              return null;
            });

    assertEquals(1, results.stream().filter(r -> r == null).count(), "수락은 정확히 한 건만 성공");
    assertTrue(results.stream().filter(r -> r != null).allMatch(r -> r instanceof BusinessException));
    SeniorReviewRequest matched = requestRepository.findById(requestId).orElseThrow();
    assertEquals(SeniorReviewStatus.MATCHED, matched.getStatus());
    assertNotNull(matched.getSenior(), "지원한 시니어 중 한 명으로 매칭된다");
  }
}
