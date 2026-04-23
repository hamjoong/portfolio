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
  private final String socialAccessToken;

  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public OAuthAttributes(
      Map<String, Object> attributes,
      String nameAttributeKey,
      String nickname,
      String email,
      String provider,
      String providerId,
      String socialAccessToken) {
    this.attributes = attributes;
    this.nameAttributeKey = nameAttributeKey;
    this.nickname = nickname;
    this.email = email;
    this.provider = provider;
    this.providerId = providerId;
    this.socialAccessToken = socialAccessToken;
  }

  public static OAuthAttributes of(
      String registrationId,
      String userNameAttributeName,
      Map<String, Object> attributes,
      String socialAccessToken) {
    if ("kakao".equals(registrationId)) {
      return ofKakao("id", attributes, socialAccessToken);
    } else if ("naver".equals(registrationId)) {
      return ofNaver("id", attributes, socialAccessToken);
    } else if ("github".equals(registrationId)) {
      return ofGithub("id", attributes, socialAccessToken);
    }
    return ofGoogle(userNameAttributeName, attributes, socialAccessToken);
  }

  private static OAuthAttributes ofGoogle(
      String userNameAttributeName, Map<String, Object> attributes, String socialAccessToken) {
    String nickname = String.valueOf(attributes.get("name"));
    Object emailObj = attributes.get("email");
    String email = (emailObj != null && !String.valueOf(emailObj).equals("null")) 
        ? String.valueOf(emailObj) : (nickname.replaceAll("\\s+", "") + "@google.com");

    return OAuthAttributes.builder()
        .nickname(nickname)
        .email(email)
        .provider("google")
        .providerId(String.valueOf(attributes.get(userNameAttributeName)))
        .attributes(attributes)
        .nameAttributeKey(userNameAttributeName)
        .socialAccessToken(socialAccessToken)
        .build();
  }

  private static OAuthAttributes ofKakao(
      String userNameAttributeName, Map<String, Object> attributes, String socialAccessToken) {
    Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
    String nickname = "KakaoUser";
    String email = null;

    if (kakaoAccount != null) {
      Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
      if (profile != null) {
        nickname = String.valueOf(profile.get("nickname"));
      }
      Object emailObj = kakaoAccount.get("email");
      email = (emailObj != null && !String.valueOf(emailObj).equals("null")) 
          ? String.valueOf(emailObj) : (nickname.replaceAll("\\s+", "") + "@kakao.com");
    }

    return OAuthAttributes.builder()
        .nickname(nickname)
        .email(email)
        .provider("kakao")
        .providerId(String.valueOf(attributes.get(userNameAttributeName)))
        .attributes(attributes)
        .nameAttributeKey(userNameAttributeName)
        .socialAccessToken(socialAccessToken)
        .build();
  }

  private static OAuthAttributes ofNaver(
      String userNameAttributeName, Map<String, Object> attributes, String socialAccessToken) {
    Map<String, Object> response = (Map<String, Object>) attributes.get("response");
    String nickname = String.valueOf(response.get("nickname"));
    Object emailObj = response.get("email");
    String email = (emailObj != null && !String.valueOf(emailObj).equals("null")) 
        ? String.valueOf(emailObj) : (nickname.replaceAll("\\s+", "") + "@naver.com");

    return OAuthAttributes.builder()
        .nickname(nickname)
        .email(email)
        .provider("naver")
        .providerId(String.valueOf(response.get("id")))
        .attributes(response)
        .nameAttributeKey("id")
        .socialAccessToken(socialAccessToken)
        .build();
  }

  private static OAuthAttributes ofGithub(
      String userNameAttributeName, Map<String, Object> attributes, String socialAccessToken) {
    String nickname = String.valueOf(attributes.get("login"));
    Object emailObj = attributes.get("email");
    String email = (emailObj != null && !String.valueOf(emailObj).equals("null")) 
        ? String.valueOf(emailObj) : (nickname + "@github.com");

    return OAuthAttributes.builder()
        .nickname(nickname)
        .email(email)
        .provider("github")
        .providerId(String.valueOf(attributes.get("id")))
        .attributes(attributes)
        .nameAttributeKey(userNameAttributeName)
        .socialAccessToken(socialAccessToken)
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
        .socialAccessToken(socialAccessToken)
        .build();
  }
}
