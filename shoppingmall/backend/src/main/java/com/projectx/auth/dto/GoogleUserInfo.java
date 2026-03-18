package com.projectx.auth.dto;

import java.util.Map;

/**
 * 구글 소셜 로그인 정보를 파싱하는 클래스입니다.
 */
public class GoogleUserInfo extends OAuth2UserInfo {
    public GoogleUserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getProviderId() { return (String) attributes.get("sub"); }

    @Override
    public String getProvider() { return "google"; }

    @Override
    public String getEmail() { return (String) attributes.get("email"); }

    @Override
    public String getName() { return (String) attributes.get("name"); }
}
