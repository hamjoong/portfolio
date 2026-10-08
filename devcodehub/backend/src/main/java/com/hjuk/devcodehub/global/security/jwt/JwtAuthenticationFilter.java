package com.hjuk.devcodehub.global.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final int BEARER_PREFIX_LENGTH = 7;
  private static final String BEARER_PREFIX = "Bearer ";

  private final JwtProvider jwtProvider;

  /**
   * [Why] 모든 요청마다 JWT 토큰의 유효성을 검사하여 인증된 사용자 정보를 SecurityContext에 저장합니다.
   *
   * @param request HttpServletRequest 객체
   * @param response HttpServletResponse 객체
   * @param filterChain FilterChain 객체
   * @throws ServletException 예외 처리
   * @throws IOException 예외 처리
   */
  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    if (request.getRequestURI().startsWith("/api/v1/ws-stomp")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = resolveToken(request);

    if (StringUtils.hasText(token) && jwtProvider.validateToken(token)) {
      Authentication auth = jwtProvider.getAuthentication(token);
      SecurityContextHolder.getContext().setAuthentication(auth);
    }

    filterChain.doFilter(request, response);
  }

  /**
   * [Why] HTTP 요청 헤더의 'Authorization' 필드에서 'Bearer ' 접두사를 제외한 실제 토큰 문자열을 추출합니다.
   *
   * @param request HttpServletRequest 객체
   * @return 추출된 토큰 문자열 (없거나 Bearer 형식이 아닐 경우 null)
   */
  private String resolveToken(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
      return bearerToken.substring(BEARER_PREFIX_LENGTH);
    }
    return null;
  }
}
