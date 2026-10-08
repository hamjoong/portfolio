package com.hjuk.devcodehub.domain.user.service.payment;

public interface PaymentStrategy {
  PaymentInfo getPaymentInfo(String paymentId);

  boolean supports(String paymentId);
}
