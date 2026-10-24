package com.hjuk.devcodehub.domain.user.service.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PaymentOwnerParserTest {

  @Test
  @DisplayName("customData의 loginId를 꺼낸다")
  void fromCustomData_valid() {
    assertEquals("tester", PaymentOwnerParser.fromCustomData("{\"loginId\":\"tester\"}"));
  }

  @Test
  @DisplayName("loginId가 없거나 문자열이 아니면 null")
  void fromCustomData_missingOrNotText() {
    assertNull(PaymentOwnerParser.fromCustomData("{}"));
    assertNull(PaymentOwnerParser.fromCustomData("{\"loginId\":123}"));
    assertNull(PaymentOwnerParser.fromCustomData("{\"loginId\":null}"));
  }

  @Test
  @DisplayName("JSON이 아니거나 null이면 예외 없이 null")
  void fromCustomData_malformed() {
    assertNull(PaymentOwnerParser.fromCustomData("not-json"));
    assertNull(PaymentOwnerParser.fromCustomData(""));
    assertNull(PaymentOwnerParser.fromCustomData(null));
  }
}
