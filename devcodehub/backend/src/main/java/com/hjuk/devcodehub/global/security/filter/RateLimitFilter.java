package com.hjuk.devcodehub.global.security.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** [Why] API 호출 빈도를 제한하여 서비스 부하를 방지하고 남용을 차단합니다. */
public class RateLimitFilter implements Filter {

  private static final int BUCKET_CAPACITY = 100;
  private static final int REFILL_TOKENS = 50;
  private static final int TOO_MANY_REQUESTS_STATUS = 429;

  private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

  private Bucket createNewBucket() {
    return Bucket.builder()
        .addLimit(
            Bandwidth.classic(
                BUCKET_CAPACITY, Refill.intervally(REFILL_TOKENS, Duration.ofSeconds(1))))
        .build();
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException {
  HttpServletRequest httpRequest = (HttpServletRequest) request;
  HttpServletResponse httpResponse = (HttpServletResponse) response;
  String path = httpRequest.getRequestURI();
  if (path.startsWith("/api/v1/ws-stomp") || path.equals("/health")) {
    chain.doFilter(request, response);
    return;
  }

  String ip = httpRequest.getRemoteAddr();
  Bucket bucket = cache.computeIfAbsent(ip, k -> createNewBucket());
    if (bucket.tryConsume(1)) {
      chain.doFilter(request, response);
    } else {
      httpResponse.setStatus(TOO_MANY_REQUESTS_STATUS);
      httpResponse.getWriter().write("Too many requests");
    }
  }
}
