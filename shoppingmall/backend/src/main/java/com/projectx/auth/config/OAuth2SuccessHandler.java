package com.projectx.auth.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

/**
 * 소셜 로그인 성공 시 실행되는 핸들러입니다.
 * [이유] 인증 성공 후 사용자 정보를 바탕으로 JWT(Access Token)를 생성하고,
 * 프론트엔드 서비스로 안전하게 전달(Redirect)하기 위함입니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;

    /**
     * 인증 성공 후 후속 처리를 수행합니다.
     * [이유] OAuth2 인증이 완료되면 클라이언트(프론트엔드)가 API를 호출할 때 사용할
     * Access Token을 발급하고, 지정된 URL로 리다이렉트 시키기 위함입니다.
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) 
            throws IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String userId = (String) oAuth2User.getAttributes().get("userId");
        String email = (String) oAuth2User.getAttributes().get("email");

        // 1. JWT 생성 (1시간 유효)
        String accessToken = jwtProvider.createAccessToken(UUID.fromString(userId), email, "ROLE_USER");

        // 2. 프론트엔드 결과 페이지로 리다이렉트 (운영 환경 주소로 수정)
        // [수정] localhost 대신 Vercel 배포 주소를 사용합니다.
        String frontendUrl = "https://shoppingmall-hamjoong.vercel.app";
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("accessToken", accessToken)
                .build().toUriString();

        log.info("[OAuth2] Authentication success. Redirect to: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
