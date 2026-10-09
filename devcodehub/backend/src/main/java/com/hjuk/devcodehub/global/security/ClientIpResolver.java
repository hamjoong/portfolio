package com.hjuk.devcodehub.global.security;

import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletRequestWrapper;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 요청의 실제 클라이언트 IP를 구한다.
 *
 * <p>[Why] X-Forwarded-For는 클라이언트가 값을 미리 채워 보낼 수 있고, 호스팅 프록시는 그 뒤에 자기가 본 IP를 덧붙이기만 한다. 맨 앞 값을 믿으면
 * 요청마다 가짜 IP를 넣어 IP별 요청 제한(로그인 시도 제한 포함)과 비회원 AI 횟수 제한을 모두 피할 수 있다. 그래서 오른쪽(프록시가 덧붙인 쪽)에서
 * 신뢰할 프록시 단계 수만큼 센 항목만 쓴다. 단계 수가 0이면 프록시가 없는 것으로 보고 접속한 쪽 주소를 그대로 쓴다.
 */
@Component
public class ClientIpResolver {

  private static final String FORWARDED_FOR = "X-Forwarded-For";
  // 숫자·점·콜론·16진수만 허용한다. 비정상 값이 제한용 맵의 키로 쌓이는 것을 막는다.
  private static final Pattern IP_LITERAL = Pattern.compile("^[0-9a-fA-F:.]{2,45}$");

  private final int trustedProxyHops;

  public ClientIpResolver(@Value("${app.security.trusted-proxy-hops:0}") int trustedProxyHops) {
    this.trustedProxyHops = trustedProxyHops;
  }

  /**
   * [Why] 요청에서 제한·집계에 쓸 클라이언트 IP를 돌려준다.
   *
   * @param request 현재 요청
   * @return 클라이언트 IP. 판단할 수 없으면 서버에 직접 접속한 쪽 주소
   */
  public String resolve(HttpServletRequest request) {
    // [Why] 프레임워크의 ForwardedHeaderFilter가 getRemoteAddr()와 X-Forwarded-For를 가공해 감싼 요청을 넘기므로, 가장 안쪽 원본 요청에서 읽는다.
    HttpServletRequest raw = unwrap(request);
    String peer = raw.getRemoteAddr();
    if (trustedProxyHops <= 0) {
      return peer;
    }
    String header = raw.getHeader(FORWARDED_FOR);
    if (header == null || header.isBlank()) {
      return peer;
    }
    List<String> hops = Arrays.stream(header.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    if (hops.size() < trustedProxyHops) {
      return peer;
    }
    String candidate = hops.get(hops.size() - trustedProxyHops);
    return IP_LITERAL.matcher(candidate).matches() ? candidate : peer;
  }

  private static HttpServletRequest unwrap(HttpServletRequest request) {
    ServletRequest current = request;
    while (current instanceof ServletRequestWrapper wrapper && wrapper.getRequest() != current) {
      current = wrapper.getRequest();
    }
    return current instanceof HttpServletRequest http ? http : request;
  }
}
