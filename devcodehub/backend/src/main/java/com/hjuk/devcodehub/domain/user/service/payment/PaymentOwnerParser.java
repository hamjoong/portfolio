package com.hjuk.devcodehub.domain.user.service.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** [Why] 결제 요청 때 customData에 심은 {"loginId":"..."} 에서 사용자 식별값을 꺼냅니다. */
final class PaymentOwnerParser {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  private PaymentOwnerParser() {
    // 유틸리티 클래스
  }

  /** @return loginId. 형식이 다르거나 없으면 null */
  static String fromCustomData(String json) {
    try {
      JsonNode node = MAPPER.readTree(json);
      JsonNode loginId = node.get("loginId");
      return loginId != null && loginId.isTextual() ? loginId.asText() : null;
    } catch (Exception e) {
      return null;
    }
  }
}
