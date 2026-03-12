package com.projectx.auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * 내부 서비스 간 통신 시 보안을 강화하기 위한 API Key 검증 필터입니다.
 * [이유] Zero Trust 원칙에 따라, 내부망 통신이라 할지라도 사전에 정의된 Secret Key를
 * 대조하여 인가된 요청인지를 확인하기 위함입니다.
 */
@Slf4j
@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    @Value("${internal.api-key}")
    private String internalApiKey;

    private static final String INTERNAL_HEADER = "X-Internal-API-Key";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestKey = request.getHeader(INTERNAL_HEADER);

        if (StringUtils.hasText(requestKey) && internalApiKey.equals(requestKey)) {
            log.info("[Internal Auth] Valid internal API key detected from: {}", request.getRemoteAddr());
            
            // 내부 서비스 호출인 경우 ROLE_INTERNAL 권한 부여
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    "INTERNAL_SERVICE", null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_INTERNAL")));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
