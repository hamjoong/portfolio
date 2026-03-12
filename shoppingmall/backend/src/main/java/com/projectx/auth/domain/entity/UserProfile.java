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
 * [이유] 개인정보와 인증 정보를 물리적으로 분리하고, KMS 기반 암호화를 강제하여
 * 데이터 유출 시 피해를 최소화하기 위함입니다.
 */
@Entity
@Table(name = "user_profiles", schema = "privacy")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfile extends BaseTimeEntity {

    /**
     * User 엔티티의 ID와 공유되는 식별자입니다.
     * [이유] 인증 정보(User)와 개인정보(UserProfile) 간의 1:1 관계를 효율적으로 유지하기 위함입니다.
     */
    @Id
    private UUID userId;

    /**
     * AWS KMS를 통해 암호화된 JSON 형태의 프로필 데이터입니다.
     * [이유] 이름, 전화번호 등 모든 민감 데이터를 일괄적으로 암호화하여 저장함으로써
     * 무단 접근 시 정보를 원천적으로 보호하기 위함입니다.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String encryptedData;

    /**
     * 데이터 암호화에 사용된 KMS 키의 ID(ARN)입니다.
     * [이유] 향후 키 로테이션(Key Rotation)이 발생했을 때 어떤 키로 암호화되었는지
     * 추적하고 올바른 키로 복호화하기 위함입니다.
     */
    @Column(nullable = false, length = 255)
    private String kmsKeyId;

    @Builder
    public UserProfile(UUID userId, String encryptedData, String kmsKeyId) {
        this.userId = userId;
        this.encryptedData = encryptedData;
        this.kmsKeyId = kmsKeyId;
    }

    /**
     * 프로필 정보를 갱신합니다.
     */
    public void updateProfile(String encryptedData, String kmsKeyId) {
        this.encryptedData = encryptedData;
        this.kmsKeyId = kmsKeyId;
    }
}
