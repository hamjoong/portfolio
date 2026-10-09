package com.hjuk.devcodehub.global.security.config;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hjuk.devcodehub.global.controller.HealthCheckController;
import com.hjuk.devcodehub.global.security.ClientIpResolver;
import com.hjuk.devcodehub.global.security.jwt.JwtProvider;
import com.hjuk.devcodehub.global.security.oauth2.CustomOAuth2UserService;
import com.hjuk.devcodehub.global.security.oauth2.OAuth2SuccessHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * [Why] 'GET /** 공개' 규칙이 관리자 규칙보다 앞서 익명에게 관리자 API가 열렸던 문제의 회귀 방지 테스트.
 * 핸들러가 없는 경로로도 보안 필터의 허용/차단 판단은 확인할 수 있다 (차단=401/403, 통과=그 외).
 */
@WebMvcTest(controllers = HealthCheckController.class)
@Import({SecurityConfig.class, ClientIpResolver.class})
@TestPropertySource(
    properties = {
      "GOOGLE_CLIENT_ID=x", "GOOGLE_CLIENT_SECRET=x", "GOOGLE_REDIRECT_URI=http://localhost/g",
      "GITHUB_CLIENT_ID=x", "GITHUB_CLIENT_SECRET=x", "GITHUB_REDIRECT_URI=http://localhost/gh",
      "KAKAO_CLIENT_ID=x", "KAKAO_CLIENT_SECRET=x", "KAKAO_REDIRECT_URI=http://localhost/k",
      "NAVER_CLIENT_ID=x", "NAVER_CLIENT_SECRET=x", "NAVER_REDIRECT_URI=http://localhost/n",
      "BACKEND_URL=http://localhost"
    })
class SecurityConfigAccessTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private JwtProvider jwtProvider;
  @MockitoBean private CustomOAuth2UserService customOAuth2UserService;
  @MockitoBean private OAuth2SuccessHandler oAuth2SuccessHandler;

  @Test
  @DisplayName("익명 사용자는 관리자 GET API에 접근할 수 없다")
  void anonymous_adminGet_unauthorized() throws Exception {
    mockMvc.perform(get("/api/v1/admin/users")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/v1/admin/stats")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/v1/admin/logs")).andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("일반 사용자(USER)는 관리자 API에 접근할 수 없다")
  void user_adminGet_forbidden() throws Exception {
    mockMvc
        .perform(get("/api/v1/admin/users").with(user("alice").roles("USER")))
        .andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("관리자는 관리자 규칙을 통과한다")
  void admin_passesSecurityRule() throws Exception {
    int statusCode =
        mockMvc
            .perform(get("/api/v1/admin/users").with(user("root").roles("ADMIN")))
            .andReturn()
            .getResponse()
            .getStatus();
    assertNotEquals(401, statusCode);
    assertNotEquals(403, statusCode);
  }

  @Test
  @DisplayName("로그인이 필요한 GET은 익명에게 막힌다 (내 정보·크레딧·알림·채팅·북마크·리뷰 결과)")
  void anonymous_privateGets_unauthorized() throws Exception {
    for (String path :
        new String[] {
          "/api/v1/users", "/api/v1/users/me", "/api/v1/credits/balance", "/api/v1/notifications",
          "/api/v1/chats/rooms", "/api/v1/chats/rooms/1/messages", "/api/v1/boards/me/bookmarks",
          "/api/v1/reviews/senior/requests/1/result", "/api/v1/reviews/senior/requests/1/applications",
          "/api/v1/reviews/latest", "/api/v1/reviews/history"
        }) {
      mockMvc.perform(get(path)).andExpect(status().isUnauthorized());
    }
  }

  @Test
  @DisplayName("둘러보기용 공개 GET은 익명도 보안 규칙을 통과한다")
  void anonymous_publicGets_allowed() throws Exception {
    for (String path :
        new String[] {
          "/health", "/api/v1/boards", "/api/v1/boards/1", "/api/v1/boards/1/comments",
          "/api/v1/rankings", "/api/v1/reviews/ai/models",
          "/api/v1/reviews/senior/requests", "/api/v1/reviews/senior/requests/1"
        }) {
      int statusCode = mockMvc.perform(get(path)).andReturn().getResponse().getStatus();
      assertNotEquals(401, statusCode, path);
      assertNotEquals(403, statusCode, path);
    }
  }

  @Test
  @DisplayName("결제 없이 크레딧을 올리던 충전·구독 엔드포인트는 더 이상 존재하지 않는다")
  void removedEndpoints_gone() throws Exception {
    // 인증된 사용자로 호출해도 핸들러가 없으므로 404 (익명이면 401)
    mockMvc
        .perform(post("/api/v1/credits/purchase").with(user("alice").roles("USER")))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(post("/api/v1/credits/subscribe").with(user("alice").roles("USER")))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("H2 콘솔 경로는 더 이상 공개되지 않는다")
  void h2Console_notPublic() throws Exception {
    mockMvc.perform(get("/h2-console")).andExpect(status().isUnauthorized());
  }
}
