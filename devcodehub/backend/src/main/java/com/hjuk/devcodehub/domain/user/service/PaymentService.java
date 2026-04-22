package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.user.dto.PaymentValidationRequest;
import com.hjuk.devcodehub.domain.user.service.payment.PaymentStrategy;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PaymentService {

  private final List<PaymentStrategy> paymentStrategies;
  private final CreditService creditService;
  private final SubscriptionService subscriptionService;

  @Transactional
  public void validateAndChargeCredits(String loginId, PaymentValidationRequest request) {
    Map<String, Object> paymentData = getPaymentInfo(request.getImpUid());

    Integer amount = (Integer) paymentData.get("amount");
    String status = (String) paymentData.get("status");

    if (amount == null || !amount.equals(request.getAmount())) {
      log.error("결제 금액 불일치: 요청={}, 실제={}", request.getAmount(), amount);
      throw new BusinessException("결제 금액이 일치하지 않습니다. 위변조가 의심됩니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    if (!"PAID".equals(status) && !"paid".equals(status)) {
      log.error("결제 미완료 상태: {}", status);
      throw new BusinessException("결제가 완료되지 않았습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    creditService.rechargeCredits(loginId, amount);
    log.info("결제 검증 및 크레딧 충전 완료: user={}, amount={}",
                com.hjuk.devcodehub.global.util.MaskingUtil.maskLoginId(loginId), amount);
  }

  @Transactional
  public void validateAndSubscribe(
      String loginId, com.hjuk.devcodehub.domain.user.dto.SubscriptionPlanRequest request) {
    Map<String, Object> paymentData = getPaymentInfo(request.getImpUid());

    Integer amount = (Integer) paymentData.get("amount");
    if (amount == null || !amount.equals(request.getAmount())) {
      throw new BusinessException("결제 금액이 일치하지 않습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    subscriptionService.subscribe(loginId, request.getPlan());
    log.info("결제 검증 및 구독 처리 완료: user={}, plan={}",
                com.hjuk.devcodehub.global.util.MaskingUtil.maskLoginId(loginId), request.getPlan());
  }

  @Cacheable(value = "paymentInfo", key = "#paymentId", unless = "#result == null")
  private Map<String, Object> getPaymentInfo(String paymentId) {
    log.info("결제 정보 조회 시작. ID: {}", paymentId);
    return paymentStrategies.stream()
        .filter(strategy -> strategy.supports(paymentId))
        .findFirst()
        .map(strategy -> strategy.getPaymentInfo(paymentId))
        .orElseThrow(
            () -> new BusinessException("지원되지 않는 결제 ID 형식입니다.", ErrorCode.INVALID_INPUT_VALUE));
  }
}
