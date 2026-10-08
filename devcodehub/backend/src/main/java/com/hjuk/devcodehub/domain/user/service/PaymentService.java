package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.user.dto.PaymentValidationRequest;
import com.hjuk.devcodehub.domain.user.dto.SubscriptionPlanRequest;
import com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository;
import com.hjuk.devcodehub.domain.user.service.payment.PaymentInfo;
import com.hjuk.devcodehub.domain.user.service.payment.PaymentStrategy;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import com.hjuk.devcodehub.global.util.MaskingUtil;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * [Why] PortOne 결제를 서버에서 다시 조회해 검증한 뒤에만 크레딧·구독을 지급합니다. 금액은 서버 기준표와 비교하고, 결제 ID는 한 번만 쓸 수
 * 있으며, 결제는 요청한 사용자 본인의 것이어야 합니다. 결제 정보는 캐시하지 않습니다(상태가 바뀔 수 있으므로).
 */
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PaymentService {

  /** 충전 가능한 금액(원). 1원 = 1크레딧. */
  private static final Set<Integer> RECHARGE_AMOUNTS = Set.of(1000, 5000, 10000, 50000);

  private final List<PaymentStrategy> paymentStrategies;
  private final CreditService creditService;
  private final SubscriptionService subscriptionService;
  private final CreditTransactionRepository transactionRepository;

  public void validateAndChargeCredits(String loginId, PaymentValidationRequest request) {
    String paymentId = request.getImpUid();
    if (!RECHARGE_AMOUNTS.contains(request.getAmount())) {
      throw new BusinessException("충전할 수 없는 금액입니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    PaymentInfo info = verifyPayment(loginId, paymentId, request.getAmount());
    creditService.rechargeByPayment(loginId, info.amount(), paymentId);
    log.info("결제 검증 및 크레딧 충전 완료: user={}, amount={}", MaskingUtil.maskLoginId(loginId), info.amount());
  }

  public void validateAndSubscribe(String loginId, SubscriptionPlanRequest request) {
    String paymentId = request.getImpUid();
    int price = subscriptionService.getPlanPrice(request.getPlan());

    // [Why] 클라이언트가 보낸 금액이 아니라 서버의 플랜 가격과 실제 결제 금액을 비교한다.
    PaymentInfo info = verifyPayment(loginId, paymentId, price);
    subscriptionService.subscribe(loginId, request.getPlan(), info.amount());
    creditService.recordSubscriptionPayment(loginId, info.amount(), paymentId);
    log.info("결제 검증 및 구독 처리 완료: user={}, plan={}", MaskingUtil.maskLoginId(loginId), request.getPlan());
  }

  /** 결제 완료 여부, 금액, 소유자, 재사용 여부를 모두 확인하고 검증된 결제 정보를 돌려준다. */
  private PaymentInfo verifyPayment(String loginId, String paymentId, int expectedAmount) {
    if (transactionRepository.existsByPaymentId(paymentId)) {
      throw new BusinessException("이미 처리된 결제입니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    PaymentInfo info = fetchPaymentInfo(paymentId);

    if (!info.paid()) {
      throw new BusinessException("결제가 완료되지 않았습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
    if (info.amount() != expectedAmount) {
      log.error("결제 금액 불일치: 기대={}, 실제={}", expectedAmount, info.amount());
      throw new BusinessException("결제 금액이 일치하지 않습니다. 위변조가 의심됩니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
    // [Why] 다른 사람의 결제 ID를 가로채 내 계정에 적용하는 것을 막는다. 결제 시 심어 둔 사용자 식별값이 나와 같아야 한다.
    if (!info.ownerRefs().contains(loginId)) {
      log.warn("결제 소유자 불일치: user={}", MaskingUtil.maskLoginId(loginId));
      throw new BusinessException("본인의 결제만 처리할 수 있습니다.", ErrorCode.HANDLE_ACCESS_DENIED);
    }
    return info;
  }

  private PaymentInfo fetchPaymentInfo(String paymentId) {
    return paymentStrategies.stream()
        .filter(strategy -> strategy.supports(paymentId))
        .findFirst()
        .map(strategy -> strategy.getPaymentInfo(paymentId))
        .orElseThrow(
            () -> new BusinessException("지원되지 않는 결제 ID 형식입니다.", ErrorCode.INVALID_INPUT_VALUE));
  }
}
