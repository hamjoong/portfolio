package com.projectx.auth.dto;

import java.util.Map;

/**
 * 카카오 소셜 로그인 정보를 파싱하는 클래스입니다.
 */
public class KakaoUserInfo extends OAuth2UserInfo {
    public KakaoUserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getProviderId() { return String.valueOf(attributes.get("id")); }

    @Override
    public String getProvider() { return "kakao"; }

    @Override
    public String getEmail() {
        Map<String, Object> account = (Map<String, Object>) attributes.get("kakao_account");
        return (account != null) ? (String) account.get("email") : null;
    }

    @Override
    public String getName() {
        Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
        return (properties != null) ? (String) properties.get("nickname") : null;
    }
}
