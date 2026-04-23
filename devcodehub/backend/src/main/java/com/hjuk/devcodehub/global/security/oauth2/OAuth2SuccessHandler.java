package com.hjuk.devcodehub.global.security.oauth2;

import com.hjuk.devcodehub.global.security.jwt.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

/** [Why] OAuth2 인증 성공 후 JWT 토큰을 발급하고 클라이언트로 리다이렉트합니다. */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

  private final JwtProvider jwtProvider;

  @Value("${FRONTEND_URL:http://localhost:5173}")
  private String frontendUrl;

  @Override
  public void onAuthenticationSuccess(
      HttpServletRequest request, HttpServletResponse response, Authentication authentication)
      throws IOException {
    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
    OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;

    String provider = authToken.getAuthorizedClientRegistrationId();
    String providerId = oAuth2User.getName();

    // DB 저장 형식인 provider_id로 loginId 생성
    String loginId = provider + "_" + providerId;
    String role = authentication.getAuthorities().iterator().next().getAuthority();

    String token = jwtProvider.createToken(loginId, role);

    // OAuth2User에서 닉네임 가져오기
    String nickname = (String) oAuth2User.getAttributes().get("nickname");
    if (nickname == null) {
      nickname = (String) oAuth2User.getAttributes().get("name");
    }
    if (nickname == null) {
      nickname = "User";
    }

    String targetUrl =
        UriComponentsBuilder.fromUriString(frontendUrl + "/login/callback")
            .queryParam("token", token)
            .queryParam("loginId", loginId)
            .queryParam("nickname", nickname)
            .queryParam("role", role)
            .build()
            .encode(java.nio.charset.StandardCharsets.UTF_8)
            .toUriString();

    getRedirectStrategy().sendRedirect(request, response, targetUrl);
  }
}
