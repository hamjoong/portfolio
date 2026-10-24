package com.hjuk.devcodehub.domain.user.service.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withResourceNotFound;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

/** [Why] PortOne V2 응답을 서비스용 결제 정보로 바꾸는 규칙(금액·상태·소유자)을 외부 호출 없이 확인한다. */
class PortoneV2StrategyTest {

  private static final String API_URL = "https://api.portone.test";
  private static final String PAYMENT_ID = "ord1700000000000123";

  private MockRestServiceServer server;
  private PortoneV2Strategy strategy;

  @BeforeEach
  void setUp() {
    RestClient.Builder builder = RestClient.builder();
    server = MockRestServiceServer.bindTo(builder).build();
    strategy = new PortoneV2Strategy(builder);
    ReflectionTestUtils.setField(strategy, "apiUrl", API_URL);
    ReflectionTestUtils.setField(strategy, "v2ApiSecret", " secret ");
  }

  private void respond(String json) {
    server
        .expect(requestTo(API_URL + "/payments/" + PAYMENT_ID))
        .andExpect(header("Authorization", "PortOne secret"))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));
  }

  @Test
  @DisplayName("imp_ 접두사가 아닌 결제 ID만 V2가 처리한다")
  void supports() {
    assertTrue(strategy.supports(PAYMENT_ID));
    assertFalse(strategy.supports("imp_123456"));
  }

  @Test
  @DisplayName("PAID 결제의 금액과 소유자(customData·customer.id)를 정규화한다")
  void paid_withOwnerRefs() {
    respond(
        "{\"status\":\"PAID\",\"amount\":{\"total\":5000},"
            + "\"customData\":\"{\\\"loginId\\\":\\\"tester\\\"}\","
            + "\"customer\":{\"id\":\"tester2\"}}");

    PaymentInfo info = strategy.getPaymentInfo(PAYMENT_ID);

    assertTrue(info.paid());
    assertEquals(5000, info.amount());
    assertEquals(Set.of("tester", "tester2"), info.ownerRefs());
    server.verify();
  }

  @Test
  @DisplayName("PAID가 아닌 상태는 paid=false")
  void notPaid() {
    respond("{\"status\":\"READY\",\"amount\":{\"total\":5000}}");

    assertFalse(strategy.getPaymentInfo(PAYMENT_ID).paid());
  }

  @Test
  @DisplayName("소유자 정보가 없거나 형식이 틀리면 소유자 목록이 비어 있다")
  void noOwnerRefs() {
    respond("{\"status\":\"PAID\",\"amount\":{\"total\":5000},\"customData\":\"not-json\"}");

    assertTrue(strategy.getPaymentInfo(PAYMENT_ID).ownerRefs().isEmpty());
  }

  @Test
  @DisplayName("금액이 없으면 거절한다")
  void missingAmount() {
    respond("{\"status\":\"PAID\"}");

    assertThrows(BusinessException.class, () -> strategy.getPaymentInfo(PAYMENT_ID));
  }

  @Test
  @DisplayName("PortOne이 결제를 찾지 못하면 BusinessException")
  void notFound() {
    server
        .expect(requestTo(API_URL + "/payments/" + PAYMENT_ID))
        .andRespond(withResourceNotFound());

    assertThrows(BusinessException.class, () -> strategy.getPaymentInfo(PAYMENT_ID));
  }
}
