package com.hjuk.devcodehub.domain.user.service.payment;

import java.util.Set;

/**
 * [Why] PortOne V1·V2의 서로 다른 응답 구조를 서비스가 한 가지 형태로 다루기 위한 정규화 결과입니다.
 *
 * @param paymentId 결제 고유 ID
 * @param amount 실제 결제 금액
 * @param paid 결제 완료 여부
 * @param ownerRefs 결제 요청 때 클라이언트가 심어 둔 사용자 식별값(loginId) 후보들
 */
public record PaymentInfo(String paymentId, int amount, boolean paid, Set<String> ownerRefs) {
  // 값만 담는 레코드
}
