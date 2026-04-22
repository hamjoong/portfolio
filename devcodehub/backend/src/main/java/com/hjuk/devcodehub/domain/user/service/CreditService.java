package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.user.domain.CreditTransaction;
import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class CreditService {

  private final UserRepository userRepository;
  private final CreditTransactionRepository transactionRepository;

  /**
   * [Why] 크레딧 사용 처리 및 내역 기록 (AI 리뷰, 시니어 리뷰 요청 등).
   *
   * @param loginId  사용자 로그인 ID
   * @param amount   사용할 금액
   * @param type     거래 타입
   * @param targetId 연관 리소스 ID
   */
  public void spendCredits(String loginId, int amount, CreditTransactionType type, Long targetId) {
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    user.deductCredits(amount);
    userRepository.save(user);
    transactionRepository.save(
        CreditTransaction.builder()
            .user(user)
            .type(type)
            .amount(-Math.abs(amount))
            .balanceAfter(user.getCredits())
            .targetId(targetId)
            .build());
  }

  /**
   * [Why] 크레딧 획득 처리 및 내역 기록 (충전, 리뷰 수행 보상 등).
   *
   * @param loginId  사용자 로그인 ID
   * @param amount   획득할 금액
   * @param type     거래 타입
   * @param targetId 연관 리소스 ID
   */
  public void earnCredits(String loginId, int amount, CreditTransactionType type, Long targetId) {
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    user.addCredits(amount);
    userRepository.save(user);
    transactionRepository.save(
        CreditTransaction.builder()
            .user(user)
            .type(type)
            .amount(Math.abs(amount))
            .balanceAfter(user.getCredits())
            .targetId(targetId)
            .build());
  }

  /**
   * [Why] 잔액 변경 없이 트랜잭션 기록만 생성 (플랫폼 수수료 등 기록용).
   *
   * @param loginId  사용자 로그인 ID
   * @param amount   기록할 금액
   * @param type     거래 타입
   * @param targetId 연관 리소스 ID
   */
  public void recordTransaction(
      String loginId, int amount, CreditTransactionType type, Long targetId) {
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    transactionRepository.save(
        CreditTransaction.builder()
            .user(user)
            .type(type)
            .amount(amount)
            .balanceAfter(user.getCredits())
            .targetId(targetId)
            .build());
  }

  /**
   * [Why] 테스트용 크레딧 충전 기능입니다.
   *
   * @param loginId 사용자 로그인 ID
   * @param amount  충전할 금액
   */
  public void rechargeCredits(String loginId, int amount) {
    earnCredits(loginId, amount, CreditTransactionType.RECHARGE, null);
  }
}
