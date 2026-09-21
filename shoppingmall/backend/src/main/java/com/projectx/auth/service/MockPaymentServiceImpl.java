package com.projectx.auth.service;

import com.projectx.auth.dto.PaymentRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * MockPaymentService의 구현체입니다.
 */
@Slf4j
@Service
public class MockPaymentServiceImpl implements MockPaymentService {

    @Override
    public boolean verifyPayment(PaymentRequest request) {
        log.info("[Payment] Verifying payment for order: {}, amount: {}", request.getOrderId(), request.getAmount());
        // 실제 연동 전까지는 항상 true를 반환하는 모의 로직입니다.
        return true;
    }

    @Override
    public boolean refundPayment(UUID orderId) {
        log.info("[Payment] Refunding payment for order: {}", orderId);
        // 실제 환불 연동 전까지는 항상 true를 반환하는 모의 로직입니다.
        return true;
    }
}
