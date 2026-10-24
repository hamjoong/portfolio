package com.hjuk.devcodehub.domain.user.service;

import static com.hjuk.devcodehub.global.testsupport.ConcurrencyRunner.runConcurrently;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.hjuk.devcodehub.domain.user.domain.CreditTransaction;
import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import java.util.List;
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
 * [Why] Mockito 단위 테스트로는 DB 행 잠금(PESSIMISTIC_WRITE)과 유니크 제약이 동시 요청에서 실제로 작동하는지 확인할 수 없다. 실제
 * PostgreSQL 컨테이너에서 여러 스레드가 동시에 같은 사용자의 크레딧을 건드려 본다. Docker가 필요하다.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@Import(CreditService.class)
@Testcontainers
// [Why] 클래스 전체를 하나의 트랜잭션으로 감싸면 스레드마다 별도 트랜잭션이 생기지 않아 동시성을 볼 수 없다.
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class CreditConcurrencyTest {

  private static final String LOGIN_ID = "concurrent-user";
  private static final int THREADS = 20;

  @Container @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

  @Autowired private CreditService creditService;
  @Autowired private UserRepository userRepository;
  @Autowired private CreditTransactionRepository transactionRepository;

  @AfterEach
  void cleanUp() {
    transactionRepository.deleteAll();
    userRepository.deleteAll();
  }

  private void createUser(int credits) {
    userRepository.save(
        User.builder()
            .loginId(LOGIN_ID)
            .nickname("tester")
            .email("tester@example.com")
            .role(Role.USER)
            .credits(credits)
            .build());
  }

  @Test
  @DisplayName("잔액 100에서 10씩 20번 동시에 차감하면 정확히 10번만 성공하고 잔액은 음수가 되지 않는다")
  void spendCredits_concurrent_neverOverspends() throws Exception {
    createUser(100);

    List<Throwable> results =
        runConcurrently(
            THREADS,
            () -> {
              creditService.spendCredits(LOGIN_ID, 10, CreditTransactionType.SPEND_AI, null);
              return null;
            });

    long succeeded = results.stream().filter(r -> r == null).count();
    long insufficient = results.stream().filter(r -> r instanceof BusinessException).count();
    assertEquals(10, succeeded);
    assertEquals(THREADS - 10, insufficient, "실패는 모두 잔액 부족(BusinessException)이어야 한다");

    User user = userRepository.findByLoginId(LOGIN_ID).orElseThrow();
    assertEquals(0, user.getCredits());
    List<CreditTransaction> transactions = transactionRepository.findAll();
    assertEquals(10, transactions.size());
    assertEquals(
        10,
        transactions.stream().map(CreditTransaction::getBalanceAfter).distinct().count(),
        "잠금으로 직렬화되어 잔액 기록이 겹치지 않아야 한다");
  }

  @Test
  @DisplayName("같은 결제 ID로 동시에 충전을 요청하면 한 번만 지급된다")
  void rechargeByPayment_concurrent_samePaymentIdChargedOnce() throws Exception {
    createUser(500);

    List<Throwable> results =
        runConcurrently(
            8,
            () -> {
              creditService.rechargeByPayment(LOGIN_ID, 1000, "pay-duplicate-1");
              return null;
            });

    assertEquals(1, results.stream().filter(r -> r == null).count());
    assertTrue(results.stream().filter(r -> r != null).allMatch(r -> r instanceof Exception));

    User user = userRepository.findByLoginId(LOGIN_ID).orElseThrow();
    assertEquals(1500, user.getCredits(), "충전은 한 번만 반영되어야 한다");
    assertEquals(1, transactionRepository.count(), "중복 요청의 거래 기록은 롤백되어야 한다");
  }
}
