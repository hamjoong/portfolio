package com.projectx.auth.service;

import com.projectx.auth.dto.PaymentRequest;
import java.util.UUID;

/**
 * 결제 검증을 위한 모의 서비스 인터페이스입니다.
 * [이유] 외부 PG 연동 전, 서버 내부에서 결제 검증 로직을 분리하여 설계하기 위함입니다.
 */
public interface MockPaymentService {
    boolean verifyPayment(PaymentRequest request);
    boolean refundPayment(UUID orderId);
}
