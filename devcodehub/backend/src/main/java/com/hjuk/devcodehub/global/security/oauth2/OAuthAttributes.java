package com.hjuk.devcodehub.global.security.oauth2;

import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

/** [Why] OAuth2 인증 정보를 매핑하기 위한 도메인 객체입니다. */
@Getter
public class OAuthAttributes {
  private final Map<String, Object> attributes;
  private final String nameAttributeKey;
  private final String nickname;
  private final String email;
  private final String provider;
  private final String providerId;

  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public OAuthAttributes(
      Map<String, Object> attributes,
      String nameAttributeKey,
      String nickname,
      String email,
      String provider,
      String providerId) {
    this.attributes = attributes;
    this.nameAttributeKey = nameAttributeKey;
    this.nickname = nickname;
    this.email = email;
    this.provider = provider;
    this.providerId = providerId;
  }

  public static OAuthAttributes of(
      String registrationId,
      String userNameAttributeName,
      Map<String, Object> attributes) {
    if ("kakao".equals(registrationId)) {
      return ofKakao("id", attributes);
    } else if ("naver".equals(registrationId)) {
      return ofNaver("id", attributes);
    } else if ("github".equals(registrationId)) {
      return ofGithub("id", attributes);
    }
    return ofGoogle(userNameAttributeName, attributes);
  }

  private static OAuthAttributes ofGoogle(
      String userNameAttributeName, Map<String, Object> attributes) {
    return OAuthAttributes.builder()
        .nickname((String) attributes.get("name"))
        .email((String) attributes.get("email"))
        .provider("google")
        .providerId(String.valueOf(attributes.get(userNameAttributeName)))
        .attributes(attributes)
        .nameAttributeKey(userNameAttributeName)
        .build();
  }

  private static OAuthAttributes ofKakao(
      String userNameAttributeName, Map<String, Object> attributes) {
    Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
    String nickname = null;
    String email = null;

    if (kakaoAccount != null) {
      Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
      if (profile != null) {
        nickname = (String) profile.get("nickname");
      }
      email = (String) kakaoAccount.get("email");
    }

    return OAuthAttributes.builder()
        .nickname(nickname)
        .email(email)
        .provider("kakao")
        .providerId(String.valueOf(attributes.get(userNameAttributeName)))
        .attributes(attributes)
        .nameAttributeKey(userNameAttributeName)
        .build();
  }

  private static OAuthAttributes ofNaver(
      String userNameAttributeName, Map<String, Object> attributes) {
    Map<String, Object> response = (Map<String, Object>) attributes.get("response");

    return OAuthAttributes.builder()
        .nickname((String) response.get("nickname"))
        .email((String) response.get("email"))
        .provider("naver")
        .providerId((String) response.get("id"))
        .attributes(response)
        .nameAttributeKey("id")
        .build();
  }

  private static OAuthAttributes ofGithub(
      String userNameAttributeName, Map<String, Object> attributes) {
    return OAuthAttributes.builder()
        .nickname((String) attributes.get("login"))
        .email((String) attributes.get("email"))
        .provider("github")
        .providerId(String.valueOf(attributes.get("id")))
        .attributes(attributes)
        .nameAttributeKey(userNameAttributeName)
        .build();
  }

  public User toEntity() {
    String defaultNickname =
        nickname != null ? nickname : (email != null ? email.split("@")[0] : "SocialUser");
    return User.builder()
        .loginId(provider + "_" + providerId)
        .nickname(defaultNickname)
        .email(email != null ? email : "social_" + providerId + "@devcodehub.com")
        .role(Role.USER)
        .provider(provider)
        .providerId(providerId)
        .build();
  }
}
