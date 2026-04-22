package com.hjuk.devcodehub.domain.user.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.hjuk.devcodehub.domain.user.domain.CreditTransaction;
import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CreditServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private CreditTransactionRepository transactionRepository;

  @InjectMocks private CreditService creditService;

  @Test
  @DisplayName("크레딧 사용 시 잔액이 차감되고 트랜잭션이 기록되어야 함")
  void spendCredits_Success() {
    // given
    String loginId = "testUser";
    int initialCredits = 1000;
    int spendAmount = 200;
    User user = User.builder().loginId(loginId).credits(initialCredits).build();

    when(userRepository.findByLoginId(loginId)).thenReturn(Optional.of(user));

    // when
    creditService.spendCredits(loginId, spendAmount, CreditTransactionType.SPEND_AI, null);

    // then
    assertEquals(initialCredits - spendAmount, user.getCredits());
    verify(transactionRepository, times(1)).save(any(CreditTransaction.class));
    verify(userRepository, times(1)).save(user);
  }

  @Test
  @DisplayName("크레딧 획득 시 잔액이 증가하고 트랜잭션이 기록되어야 함")
  void earnCredits_Success() {
    // given
    String loginId = "testUser";
    int initialCredits = 500;
    int earnAmount = 300;
    User user = User.builder().loginId(loginId).credits(initialCredits).build();

    when(userRepository.findByLoginId(loginId)).thenReturn(Optional.of(user));

    // when
    creditService.earnCredits(loginId, earnAmount, CreditTransactionType.EARN_REVIEW, 1L);

    // then
    assertEquals(initialCredits + earnAmount, user.getCredits());
    verify(transactionRepository, times(1)).save(any(CreditTransaction.class));
  }
}
