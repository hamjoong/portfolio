package com.hjuk.devcodehub.domain.user.service.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * [Why] V1 전략은 내부에서 RestTemplate을 직접 만들어 목으로 바꿀 수 없으므로, 로컬 HTTP 서버를 PortOne 대역으로 띄워 토큰 발급 → 결제 조회
 * → 정규화 흐름을 확인한다.
 */
class IamportV1StrategyTest {

  private static final String IMP_UID = "imp_123456789";

  private HttpServer server;
  private String paymentResponse;
  private IamportV1Strategy strategy;

  @BeforeEach
  void setUp() throws Exception {
    server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    server.createContext(
        "/users/getToken", exchange -> reply(exchange, "{\"response\":{\"access_token\":\"tok\"}}"));
    server.createContext(
        "/payments/" + IMP_UID,
        exchange -> {
          // 발급받은 토큰으로 조회했는지 확인한다.
          String auth = exchange.getRequestHeaders().getFirst("Authorization");
          reply(exchange, "tok".equals(auth) ? paymentResponse : "{\"response\":null}");
        });
    server.start();

    strategy = new IamportV1Strategy();
    ReflectionTestUtils.setField(strategy, "apiUrl", "http://127.0.0.1:" + server.getAddress().getPort());
    ReflectionTestUtils.setField(strategy, "v1ApiKey", "key");
    ReflectionTestUtils.setField(strategy, "v1ApiSecret", "secret");
  }

  @AfterEach
  void tearDown() {
    server.stop(0);
  }

  private static void reply(com.sun.net.httpserver.HttpExchange exchange, String body)
      throws java.io.IOException {
    byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().add("Content-Type", "application/json");
    exchange.sendResponseHeaders(200, bytes.length);
    exchange.getResponseBody().write(bytes);
    exchange.close();
  }

  @Test
  @DisplayName("imp_ 접두사 결제만 V1이 처리한다")
  void supports() {
    assertTrue(strategy.supports(IMP_UID));
    assertFalse(strategy.supports("ord1700000000000123"));
  }

  @Test
  @DisplayName("paid 결제의 금액과 custom_data 소유자를 정규화한다")
  void paid_withOwner() {
    paymentResponse =
        "{\"response\":{\"status\":\"paid\",\"amount\":10000,"
            + "\"custom_data\":\"{\\\"loginId\\\":\\\"tester\\\"}\"}}";

    PaymentInfo info = strategy.getPaymentInfo(IMP_UID);

    assertTrue(info.paid());
    assertEquals(10000, info.amount());
    assertEquals(Set.of("tester"), info.ownerRefs());
  }

  @Test
  @DisplayName("paid가 아니면 paid=false, custom_data가 없으면 소유자 목록이 비어 있다")
  void notPaid_noOwner() {
    paymentResponse = "{\"response\":{\"status\":\"ready\",\"amount\":10000}}";

    PaymentInfo info = strategy.getPaymentInfo(IMP_UID);

    assertFalse(info.paid());
    assertTrue(info.ownerRefs().isEmpty());
  }

  @Test
  @DisplayName("금액이 없으면 거절한다")
  void missingAmount() {
    paymentResponse = "{\"response\":{\"status\":\"paid\"}}";

    assertThrows(BusinessException.class, () -> strategy.getPaymentInfo(IMP_UID));
  }

  @Test
  @DisplayName("API 키·시크릿이 비어 있으면 PortOne을 호출하지 않고 거절한다")
  void missingCredentials() {
    ReflectionTestUtils.setField(strategy, "v1ApiKey", " ");

    assertThrows(BusinessException.class, () -> strategy.getPaymentInfo(IMP_UID));
  }
}
