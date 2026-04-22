package com.hjuk.devcodehub.domain.user.service.payment;

import java.util.Map;

public interface PaymentStrategy {
  Map<String, Object> getPaymentInfo(String paymentId);

  boolean supports(String paymentId);
}
