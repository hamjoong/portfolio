package com.projectx.auth.dto;

import java.util.Map;

/**
 * 다양한 소셜 제공자(Google, Kakao 등)의 사용자 정보를 공통된 방식으로 추출하기 위한 인터페이스입니다.
 * [이유] 소셜 서비스마다 응답하는 JSON 구조가 다르기 때문에, 이를 추상화하여
 * 서비스 로직에서 제공자에 상관없이 동일한 방식으로 데이터를 처리하기 위함입니다.
 */
public abstract class OAuth2UserInfo {
    protected Map<String, Object> attributes;

    public OAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public abstract String getProviderId();
    public abstract String getProvider();
    public abstract String getEmail();
    public abstract String getName();
}
