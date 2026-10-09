package com.hjuk.devcodehub.global.security.filter;

import com.hjuk.devcodehub.global.security.ClientIpResolver;
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
import java.util.concurrent.atomic.AtomicLong;

/**
 * [Why] API 호출 빈도를 제한하여 서비스 부하를 방지하고 남용을 차단합니다. IP별 버킷은 일정 시간 쓰지 않으면 정리해 메모리가 무한히
 * 늘지 않게 하고, 로그인·회원가입은 무차별 대입을 막기 위해 더 낮은 한도를 적용합니다.
 */
public class RateLimitFilter implements Filter {

  private static final int BUCKET_CAPACITY = 100;
  private static final int REFILL_TOKENS = 50;
  private static final int AUTH_BUCKET_CAPACITY = 10;
  private static final int TOO_MANY_REQUESTS_STATUS = 429;
  private static final long IDLE_EVICT_MILLIS = Duration.ofMinutes(10).toMillis();
  private static final long CLEANUP_INTERVAL_MILLIS = Duration.ofMinutes(1).toMillis();

  private static final class Entry {
    private final Bucket bucket;
    private volatile long lastSeen;

    Entry(Bucket bucket) {
      this.bucket = bucket;
    }

    boolean tryConsume() {
      lastSeen = System.currentTimeMillis();
      return bucket.tryConsume(1);
    }

    boolean idleSince(long now) {
      return now - lastSeen > IDLE_EVICT_MILLIS;
    }
  }

  private final Map<String, Entry> cache = new ConcurrentHashMap<>();
  private final Map<String, Entry> authCache = new ConcurrentHashMap<>();
  private final AtomicLong lastCleanup = new AtomicLong(System.currentTimeMillis());
  private final ClientIpResolver clientIpResolver;

  public RateLimitFilter(ClientIpResolver clientIpResolver) {
    this.clientIpResolver = clientIpResolver;
  }

  private Bucket createNewBucket() {
    return Bucket.builder()
        .addLimit(
            Bandwidth.classic(
                BUCKET_CAPACITY, Refill.intervally(REFILL_TOKENS, Duration.ofSeconds(1))))
        .build();
  }

  private Bucket createAuthBucket() {
    return Bucket.builder()
        .addLimit(
            Bandwidth.classic(
                AUTH_BUCKET_CAPACITY, Refill.intervally(AUTH_BUCKET_CAPACITY, Duration.ofMinutes(1))))
        .build();
  }

  private boolean tryConsume(Map<String, Entry> map, String ip, boolean auth) {
    Entry entry = map.computeIfAbsent(ip, k -> new Entry(auth ? createAuthBucket() : createNewBucket()));
    return entry.tryConsume();
  }

  private void evictIdle() {
    long now = System.currentTimeMillis();
    long last = lastCleanup.get();
    if (now - last < CLEANUP_INTERVAL_MILLIS || !lastCleanup.compareAndSet(last, now)) {
      return;
    }
    cache.values().removeIf(e -> e.idleSince(now));
    authCache.values().removeIf(e -> e.idleSince(now));
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

    evictIdle();

    // [Why] 클라이언트가 조작할 수 있는 X-Forwarded-For를 그대로 믿지 않고, 신뢰할 프록시 단계만 센 IP를 쓴다.
    String ip = clientIpResolver.resolve(httpRequest);
    boolean authPath =
        "POST".equals(httpRequest.getMethod())
            && (path.equals("/api/v1/auth/login") || path.equals("/api/v1/auth/signup"));

    boolean allowed = tryConsume(cache, ip, false) && (!authPath || tryConsume(authCache, ip, true));
    if (allowed) {
      chain.doFilter(request, response);
    } else {
      httpResponse.setStatus(TOO_MANY_REQUESTS_STATUS);
      httpResponse.getWriter().write("Too many requests");
    }
  }
}
