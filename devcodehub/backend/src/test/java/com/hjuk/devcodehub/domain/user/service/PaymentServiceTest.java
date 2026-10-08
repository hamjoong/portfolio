package com.hjuk.devcodehub.domain.user.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hjuk.devcodehub.domain.user.domain.SubscriptionPlan;
import com.hjuk.devcodehub.domain.user.dto.PaymentValidationRequest;
import com.hjuk.devcodehub.domain.user.dto.SubscriptionPlanRequest;
import com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository;
import com.hjuk.devcodehub.domain.user.service.payment.PaymentInfo;
import com.hjuk.devcodehub.domain.user.service.payment.PaymentStrategy;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

  private static final String USER = "tester";
  private static final String PAYMENT_ID = "ord1700000000000123";

  @Mock private CreditService creditService;
  @Mock private SubscriptionService subscriptionService;
  @Mock private CreditTransactionRepository transactionRepository;

  private PaymentStrategy strategy;
  private PaymentService paymentService;

  @BeforeEach
  void setUp() {
    strategy = mock(PaymentStrategy.class);
    org.mockito.Mockito.lenient().when(strategy.supports(anyString())).thenReturn(true);
    paymentService =
        new PaymentService(List.of(strategy), creditService, subscriptionService, transactionRepository);
  }

  private PaymentValidationRequest rechargeRequest(int amount) {
    PaymentValidationRequest request = new PaymentValidationRequest();
    request.setImpUid(PAYMENT_ID);
    request.setMerchantUid(PAYMENT_ID);
    request.setAmount(amount);
    return request;
  }

  private SubscriptionPlanRequest subscribeRequest(SubscriptionPlan plan) {
    SubscriptionPlanRequest request = new SubscriptionPlanRequest();
    request.setPlan(plan);
    request.setImpUid(PAYMENT_ID);
    request.setAmount(0);
    return request;
  }

  private void paid(int amount, String owner) {
    when(strategy.getPaymentInfo(PAYMENT_ID))
        .thenReturn(new PaymentInfo(PAYMENT_ID, amount, true, Set.of(owner)));
  }

  @Test
  @DisplayName("정상 결제는 결제 ID와 함께 크레딧이 충전된다")
  void recharge_success() {
    paid(5000, USER);

    paymentService.validateAndChargeCredits(USER, rechargeRequest(5000));

    verify(creditService).rechargeByPayment(USER, 5000, PAYMENT_ID);
  }

  @Test
  @DisplayName("이미 처리된 결제 ID는 거절된다 (이중 충전 방지)")
  void recharge_duplicatePaymentId() {
    when(transactionRepository.existsByPaymentId(PAYMENT_ID)).thenReturn(true);

    assertThrows(
        BusinessException.class,
        () -> paymentService.validateAndChargeCredits(USER, rechargeRequest(5000)));

    verify(creditService, never()).rechargeByPayment(anyString(), anyInt(), anyString());
  }

  @Test
  @DisplayName("허용되지 않은 충전 금액은 PortOne 조회 전에 거절된다")
  void recharge_invalidAmount() {
    assertThrows(
        BusinessException.class,
        () -> paymentService.validateAndChargeCredits(USER, rechargeRequest(7777)));

    verify(strategy, never()).getPaymentInfo(anyString());
  }

  @Test
  @DisplayName("실제 결제 금액이 요청 금액과 다르면 거절된다")
  void recharge_amountMismatch() {
    paid(1000, USER);

    assertThrows(
        BusinessException.class,
        () -> paymentService.validateAndChargeCredits(USER, rechargeRequest(50000)));

    verify(creditService, never()).rechargeByPayment(anyString(), anyInt(), anyString());
  }

  @Test
  @DisplayName("결제가 완료되지 않았으면 거절된다")
  void recharge_notPaid() {
    when(strategy.getPaymentInfo(PAYMENT_ID))
        .thenReturn(new PaymentInfo(PAYMENT_ID, 5000, false, Set.of(USER)));

    assertThrows(
        BusinessException.class,
        () -> paymentService.validateAndChargeCredits(USER, rechargeRequest(5000)));

    verify(creditService, never()).rechargeByPayment(anyString(), anyInt(), anyString());
  }

  @Test
  @DisplayName("다른 사용자의 결제는 내 계정에 적용할 수 없다")
  void recharge_otherUsersPayment() {
    paid(5000, "someoneElse");

    assertThrows(
        BusinessException.class,
        () -> paymentService.validateAndChargeCredits(USER, rechargeRequest(5000)));

    verify(creditService, never()).rechargeByPayment(anyString(), anyInt(), anyString());
  }

  @Test
  @DisplayName("구독은 클라이언트 금액이 아니라 서버 가격표로 검증된다")
  void subscribe_usesServerPrice() {
    when(subscriptionService.getPlanPrice(SubscriptionPlan.YEARLY)).thenReturn(99000);
    paid(100, USER); // 100원만 결제하고 연간 구독을 시도

    assertThrows(
        BusinessException.class,
        () -> paymentService.validateAndSubscribe(USER, subscribeRequest(SubscriptionPlan.YEARLY)));

    verify(subscriptionService, never()).subscribe(anyString(), any(), anyInt());
  }

  @Test
  @DisplayName("구독 결제가 맞으면 실결제 금액으로 구독이 시작되고 결제 ID가 기록된다")
  void subscribe_success() {
    when(subscriptionService.getPlanPrice(SubscriptionPlan.MONTHLY)).thenReturn(9900);
    paid(9900, USER);

    paymentService.validateAndSubscribe(USER, subscribeRequest(SubscriptionPlan.MONTHLY));

    verify(subscriptionService).subscribe(USER, SubscriptionPlan.MONTHLY, 9900);
    verify(creditService).recordSubscriptionPayment(eq(USER), eq(9900), eq(PAYMENT_ID));
  }
}
