package com.projectx.auth.service;

import com.projectx.auth.domain.entity.SocialAccount;
import com.projectx.auth.domain.entity.User;
import com.projectx.auth.domain.repository.SocialAccountRepository;
import com.projectx.auth.domain.repository.UserRepository;
import com.projectx.auth.dto.GoogleUserInfo;
import com.projectx.auth.dto.KakaoUserInfo;
import com.projectx.auth.dto.OAuth2UserInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;

/**
 * 소셜 로그인 사용자 정보를 처리하는 서비스 클래스입니다.
 * [이유] 외부 제공자로부터 전달받은 사용자 속성을 통합된 회원 체계로 매핑하고,
 * 신규 가입자와 기존 사용자를 구분하여 처리하기 위함입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;

    /**
     * OAuth2 사용자 정보를 로드하여 처리합니다.
     * [이유] Spring Security의 OAuth2 흐름 중 사용자 정보를 가져오는 시점에 개입하여,
     * 우리 서비스의 DB와 동기화하고 커스텀 인증 객체를 생성하기 위함입니다.
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // 1. 소셜 제공자별 파싱 로직 분기
        OAuth2UserInfo userInfo = switch (provider) {
            case "google" -> new GoogleUserInfo(attributes);
            case "kakao" -> new KakaoUserInfo(attributes);
            default -> throw new OAuth2AuthenticationException("지원하지 않는 소셜 서비스입니다.");
        };

        // 2. 가입 및 연동 처리 (DB 트랜잭션은 이 메서드 내부에서만 동작함)
        User user = saveOrUpdate(userInfo);

        // 3. SecurityContext에 저장할 사용자 객체 반환
        return new DefaultOAuth2User(
                Collections.emptyList(), 
                Map.of(
                    "userId", user.getId().toString(),
                    "email", user.getEmail()
                ),
                "email" 
        );
    }

    /**
     * 소셜 정보를 기반으로 사용자를 조회하거나 신규 등록합니다.
     * [이유] 동일한 소셜 ID로 재로그인 시에는 기존 유저를 반환하고,
     * 처음 로그인한 경우에는 새로운 User와 SocialAccount를 생성하여 연동하기 위함입니다.
     * DB 저장 작업이므로 Transactional을 통해 정합성을 보장합니다.
     */
    @Transactional
    public User saveOrUpdate(OAuth2UserInfo userInfo) {
        return socialAccountRepository.findByProviderAndProviderId(userInfo.getProvider(), userInfo.getProviderId())
                .map(SocialAccount::getUser)
                .orElseGet(() -> {
                    // 신규 유저 생성 (비밀번호 없는 소셜 전용 유저)
                    User user = userRepository.findByEmail(userInfo.getEmail())
                            .orElseGet(() -> userRepository.save(User.builder().email(userInfo.getEmail()).build()));

                    socialAccountRepository.save(SocialAccount.builder()
                            .user(user)
                            .provider(userInfo.getProvider())
                            .providerId(userInfo.getProviderId())
                            .build());
                    
                    log.info("[Social] New user linked: provider={}, email={}", userInfo.getProvider(), userInfo.getEmail());
                    return user;
                });
    }
}
