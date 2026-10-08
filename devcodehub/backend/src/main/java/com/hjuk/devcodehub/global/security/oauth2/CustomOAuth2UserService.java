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

    OAuthAttributes attributes =
        OAuthAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

    // [Why] 소셜 액세스 토큰은 서비스에서 쓸 곳이 없고 평문 저장 시 유출 위험만 있어 저장하지 않는다.
    User user = saveOrUpdate(attributes);

    return new DefaultOAuth2User(
        Collections.singleton(new SimpleGrantedAuthority(user.getRole().getKey())),
        attributes.getAttributes(),
        attributes.getNameAttributeKey());
  }

  private User saveOrUpdate(OAuthAttributes attributes) {
    String socialLoginId = attributes.getProvider() + "_" + attributes.getProviderId();
    User user =
        userRepository
            .findByLoginId(socialLoginId)
            // [Why] 재로그인 시 사용자가 바꾼 닉네임 등을 덮어쓰지 않도록 기존 사용자는 그대로 둔다.
            .orElseGet(() -> userRepository.save(attributes.toEntity()));

    return user;
  }
}
