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
            .findByLoginIdForUpdate(loginId)
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
    earnCredits(loginId, amount, type, targetId, null);
  }

  /**
   * [Why] 결제로 얻은 크레딧은 결제 ID를 함께 기록해 같은 결제로 중복 충전되지 않게 한다.
   *
   * @param loginId   사용자 로그인 ID
   * @param amount    획득할 금액
   * @param type      거래 타입
   * @param targetId  연관 리소스 ID
   * @param paymentId 결제 ID (결제와 무관하면 null)
   */
  public void earnCredits(
      String loginId, int amount, CreditTransactionType type, Long targetId, String paymentId) {
    User user =
        userRepository
            .findByLoginIdForUpdate(loginId)
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
            .paymentId(paymentId)
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
   * [Why] 검증이 끝난 결제 금액만큼 크레딧을 충전합니다. 결제 ID는 유니크로 기록됩니다.
   *
   * @param loginId   사용자 로그인 ID
   * @param amount    충전할 금액
   * @param paymentId 검증된 결제 ID
   */
  public void rechargeByPayment(String loginId, int amount, String paymentId) {
    earnCredits(loginId, amount, CreditTransactionType.RECHARGE, null, paymentId);
  }

  /**
   * [Why] 구독 결제를 원장에 남긴다. 잔액은 바뀌지 않고, 결제 ID 유니크 제약으로 같은 결제의 재사용을 막는다.
   *
   * @param loginId   사용자 로그인 ID
   * @param amount    결제 금액
   * @param paymentId 검증된 결제 ID
   */
  public void recordSubscriptionPayment(String loginId, int amount, String paymentId) {
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    transactionRepository.save(
        CreditTransaction.builder()
            .user(user)
            .type(CreditTransactionType.SUBSCRIBE)
            .amount(amount)
            .balanceAfter(user.getCredits())
            .paymentId(paymentId)
            .build());
  }
}
