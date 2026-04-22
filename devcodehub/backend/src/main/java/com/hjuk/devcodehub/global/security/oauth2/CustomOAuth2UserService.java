package com.hjuk.devcodehub.global.security.oauth2;

import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

  private final UserRepository userRepository;

  @Override
  public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
    OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
    OAuth2User oAuth2User = delegate.loadUser(userRequest);

    String registrationId = userRequest.getClientRegistration().getRegistrationId();
    String userNameAttributeName =
        userRequest
            .getClientRegistration()
            .getProviderDetails()
            .getUserInfoEndpoint()
            .getUserNameAttributeName();

    // [Why] 소셜 서비스 액세스 토큰을 추출하여 GitHub API 연동 등에 활용함
    String socialAccessToken = userRequest.getAccessToken().getTokenValue();

    OAuthAttributes attributes =
        OAuthAttributes.of(
            registrationId, userNameAttributeName, oAuth2User.getAttributes(), socialAccessToken);

    User user = saveOrUpdate(attributes, socialAccessToken);

    return new DefaultOAuth2User(
        Collections.singleton(new SimpleGrantedAuthority(user.getRole().getKey())),
        attributes.getAttributes(),
        attributes.getNameAttributeKey());
  }

  private User saveOrUpdate(OAuthAttributes attributes, String socialAccessToken) {
    String socialLoginId = attributes.getProvider() + "_" + attributes.getProviderId();
    User user =
        userRepository
            .findByLoginId(socialLoginId)
            .map(
                entity -> {
                  // [Why] 소셜 로그인 재로그인 시 기존에 사용자가 변경한 닉네임이 초기화되는 것을 방지함.
                  // 기존 정보를 유지하고 소셜 API 연동을 위한 토큰만 최신화함.
                  entity.updateSocialToken(socialAccessToken);
                  return entity;
                })
            .orElseGet(attributes::toEntity);

    return userRepository.save(user);
  }
}
