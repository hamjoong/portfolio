package com.projectx.auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * 모든 HTTP 요청에 대해 JWT 토큰을 검사하는 보안 필터입니다.
 * [이유] 클라이언트가 보낸 토큰의 유효성을 매 요청마다 확인하고, 인증 성공 시
 * SecurityContext에 사용자의 신원 정보를 저장하여 후속 로직에서 활용하기 위함입니다.
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    /**
     * 필터의 핵심 로직을 수행합니다.
     * [이유] 요청 헤더에서 "Bearer "로 시작하는 토큰을 추출하고, 검증이 완료된 토큰에 한해
     * Spring Security의 인증 시스템(SecurityContext)에 등록하기 위함입니다.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = resolveToken(request);

            if (StringUtils.hasText(jwt) && jwtProvider.validateToken(jwt)) {
                String userId = jwtProvider.getUserIdFromToken(jwt);
                String role = jwtProvider.getRoleFromToken(jwt);
                
                log.info("[JWT Filter] Valid token. User: {}, Role: {}", userId, role);

                // role이 없는 경우 기본 ROLE_USER 부여 (하위 호환성)
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority(role != null ? role : "ROLE_USER")
                );

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userId, null, authorities);
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.error("[JWT Filter] Error during authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * HTTP 요청 헤더에서 토큰을 추출합니다.
     * [이유] 표준화된 Bearer 인증 방식(Authorization 헤더)을 준수하여 토큰을 식별하기 위함입니다.
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
