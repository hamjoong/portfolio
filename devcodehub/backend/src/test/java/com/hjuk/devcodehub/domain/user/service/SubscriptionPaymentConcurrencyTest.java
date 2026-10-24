package com.hjuk.devcodehub.domain.user.service;

import static com.hjuk.devcodehub.global.testsupport.ConcurrencyRunner.runConcurrently;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.SubscriptionPlan;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.dto.SubscriptionPlanRequest;
import com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository;
import com.hjuk.devcodehub.domain.user.repository.SubscriptionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.payment.PaymentInfo;
import com.hjuk.devcodehub.domain.user.service.payment.PaymentStrategy;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * [Why] 구독 결제 경로(PaymentService → SubscriptionService → CreditService)에서 같은 결제 ID가 동시에 들어와도 구독과 원장이 한 건씩만
 * 남는지, 실제 PostgreSQL의 유니크 제약으로 확인한다. PortOne 호출은 고정 응답을 돌려주는 대역으로 바꾼다. Docker가 필요하다.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@Import({
  PaymentService.class,
  CreditService.class,
  SubscriptionService.class,
  SubscriptionPaymentConcurrencyTest.FakePortOneConfig.class
})
@Testcontainers
// [Why] 클래스 전체를 하나의 트랜잭션으로 감싸면 스레드마다 별도 트랜잭션이 생기지 않아 동시성을 볼 수 없다.
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class SubscriptionPaymentConcurrencyTest {

  private static final String LOGIN_ID = "subscriber";
  private static final String PAYMENT_ID = "pay-subscribe-1";
  private static final int MONTHLY_PRICE = 9900;

  @Container @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

  /** 어떤 결제 ID든 구독자 본인이 월간 가격을 결제 완료한 것으로 응답하는 PortOne 대역. */
  @TestConfiguration
  static class FakePortOneConfig {
    @Bean
    PaymentStrategy fakePaymentStrategy() {
      return new PaymentStrategy() {
        @Override
        public boolean supports(String paymentId) {
          return true;
        }

        @Override
        public PaymentInfo getPaymentInfo(String paymentId) {
          return new PaymentInfo(paymentId, MONTHLY_PRICE, true, Set.of(LOGIN_ID));
        }
      };
    }
  }

  @Autowired private PaymentService paymentService;
  @Autowired private UserRepository userRepository;
  @Autowired private SubscriptionRepository subscriptionRepository;
  @Autowired private CreditTransactionRepository transactionRepository;

  @AfterEach
  void cleanUp() {
    transactionRepository.deleteAll();
    subscriptionRepository.deleteAll();
    userRepository.deleteAll();
  }

  @Test
  @DisplayName("같은 결제 ID로 동시에 구독을 요청하면 구독과 결제 기록이 한 건만 남는다")
  void subscribe_concurrent_samePaymentIdProcessedOnce() throws Exception {
    userRepository.save(
        User.builder()
            .loginId(LOGIN_ID)
            .nickname("tester")
            .email("tester@example.com")
            .role(Role.USER)
            .credits(500)
            .build());
    SubscriptionPlanRequest request = new SubscriptionPlanRequest();
    request.setPlan(SubscriptionPlan.MONTHLY);
    request.setImpUid(PAYMENT_ID);
    request.setAmount(MONTHLY_PRICE);

    List<Throwable> results =
        runConcurrently(
            8,
            () -> {
              paymentService.validateAndSubscribe(LOGIN_ID, request);
              return null;
            });

    assertEquals(1, results.stream().filter(r -> r == null).count(), "성공은 정확히 한 건");
    assertEquals(1, subscriptionRepository.count(), "중복 요청의 구독은 롤백되어야 한다");
    assertEquals(1, transactionRepository.count(), "중복 요청의 결제 기록은 롤백되어야 한다");
    assertEquals(
        CreditTransactionType.SUBSCRIBE, transactionRepository.findAll().get(0).getType());
    assertEquals(
        MONTHLY_PRICE, subscriptionRepository.findAll().get(0).getPaidAmount(), "실결제 금액이 보관되어야 한다");
    assertEquals(
        500, userRepository.findByLoginId(LOGIN_ID).orElseThrow().getCredits(), "구독 결제는 잔액을 바꾸지 않는다");
  }
}
