package com.projectx.auth.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 사용자의 민감 정보를 별도의 스키마(privacy)에 분리하여 저장하는 엔티티입니다.
 * [이유] 개인정보와 인증 정보를 물리적으로 분리하여 데이터 유출 시 피해를 최소화하기 위함입니다.
 */
@Entity
@Table(name = "user_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfile extends BaseTimeEntity {

    @Id
    private UUID userId;

    /**
     * 암호화된 JSON 형태의 프로필 데이터입니다.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String encryptedData;

    @Builder
    public UserProfile(UUID userId, String encryptedData) {
        this.userId = userId;
        this.encryptedData = encryptedData;
    }

    /**
     * 프로필 정보를 갱신합니다.
     */
    public void updateProfile(String encryptedData) {
        this.encryptedData = encryptedData;
    }
}
