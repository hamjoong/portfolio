package com.projectx.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 결제 요청을 위한 DTO입니다.
 * [이유] 외부 PG사에 결제를 요청할 때 중복 결제를 방지하기 위한 
 * 멱등성 키(Idempotency Key)를 포함하여 설계합니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private UUID orderId;
    private BigDecimal amount;
    
    /**
     * 멱등성 키입니다.
     * [이유] 동일한 주문에 대해 여러 번 결제 요청이 가더라도, PG사에서 이 키를 확인하여
     * 단 한 번만 결제가 승인되도록 보장하기 위함입니다.
     */
    private String idempotencyKey;
}
