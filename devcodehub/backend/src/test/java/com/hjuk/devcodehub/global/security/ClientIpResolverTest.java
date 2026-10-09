package com.hjuk.devcodehub.global.security;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ClientIpResolverTest {

  private static MockHttpServletRequest request(String peer, String forwardedFor) {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr(peer);
    if (forwardedFor != null) {
      request.addHeader("X-Forwarded-For", forwardedFor);
    }
    return request;
  }

  @Test
  @DisplayName("신뢰 단계 0이면 헤더를 무시하고 접속한 쪽 주소를 쓴다")
  void zeroHopsIgnoresHeader() {
    ClientIpResolver resolver = new ClientIpResolver(0);

    assertThat(resolver.resolve(request("127.0.0.1", "6.6.6.6"))).isEqualTo("127.0.0.1");
  }

  @Test
  @DisplayName("프록시가 덧붙인 오른쪽 항목을 쓰고, 클라이언트가 앞에 채운 가짜 IP는 무시한다")
  void spoofedLeadingEntriesAreIgnored() {
    ClientIpResolver resolver = new ClientIpResolver(2);

    // 구성: [클라이언트가 보낸 값], 실제 클라이언트, 앞단 프록시
    assertThat(resolver.resolve(request("10.0.0.1", "6.6.6.6, 203.0.113.5, 172.70.1.1")))
        .isEqualTo("203.0.113.5");
    assertThat(resolver.resolve(request("10.0.0.1", "1.1.1.1, 2.2.2.2, 3.3.3.3, 203.0.113.5, 172.70.1.1")))
        .isEqualTo("203.0.113.5");
    assertThat(resolver.resolve(request("10.0.0.1", "203.0.113.5, 172.70.1.1"))).isEqualTo("203.0.113.5");
  }

  @Test
  @DisplayName("헤더가 없거나 기대한 단계보다 짧으면 접속한 쪽 주소로 되돌린다")
  void fallsBackToPeer() {
    ClientIpResolver resolver = new ClientIpResolver(2);

    assertThat(resolver.resolve(request("10.0.0.1", null))).isEqualTo("10.0.0.1");
    assertThat(resolver.resolve(request("10.0.0.1", "  "))).isEqualTo("10.0.0.1");
    assertThat(resolver.resolve(request("10.0.0.1", "6.6.6.6"))).isEqualTo("10.0.0.1");
  }

  @Test
  @DisplayName("IP 모양이 아닌 값은 쓰지 않는다")
  void rejectsNonIpValues() {
    ClientIpResolver resolver = new ClientIpResolver(1);

    assertThat(resolver.resolve(request("10.0.0.1", "<script>alert(1)</script>"))).isEqualTo("10.0.0.1");
    assertThat(resolver.resolve(request("10.0.0.1", "2001:db8::1"))).isEqualTo("2001:db8::1");
  }

  @Test
  @DisplayName("프레임워크가 가공해 감싼 요청이 와도 가장 안쪽 원본 요청에서 읽는다")
  void readsOriginalRequestBehindWrapper() {
    ClientIpResolver resolver = new ClientIpResolver(2);
    HttpServletRequest original = request("10.0.0.1", "6.6.6.6, 203.0.113.5, 172.70.1.1");
    // ForwardedHeaderFilter처럼 원격 주소를 맨 앞 값으로 바꾸고 헤더를 숨기는 래퍼
    HttpServletRequest wrapped =
        new HttpServletRequestWrapper(original) {
          @Override
          public String getRemoteAddr() {
            return "6.6.6.6";
          }

          @Override
          public String getHeader(String name) {
            return null;
          }
        };

    assertThat(resolver.resolve(wrapped)).isEqualTo("203.0.113.5");
  }
}
