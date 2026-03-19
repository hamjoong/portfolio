package com.projectx.auth.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 외부 소셜 인증(Google, Kakao 등) 연동 정보를 관리하는 엔티티입니다.
 * [이유] 사용자가 여러 소셜 계정을 하나의 서비스 계정에 연결하거나,
 * 소셜 로그인 시 서비스 사용자를 식별하기 위함입니다.
 */
@Entity
@Table(name = "social_accounts", 
       uniqueConstraints = {@UniqueConstraint(columnNames = {"provider", "providerId"})})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SocialAccount extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 연동된 사용자 엔티티입니다.
     * [이유] 소셜 정보를 통해 실제 서비스 사용자를 식별하기 위함입니다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 소셜 제공자 이름입니다. (예: google, kakao)
     * [이유] 동일한 사용자 ID라도 제공자에 따라 구분하기 위함입니다.
     */
    @Column(nullable = false, length = 20)
    private String provider;

    /**
     * 소셜 제공자에서 부여한 사용자의 고유 ID입니다.
     * [이유] 소셜 서비스 재로그인 시 동일 사용자인지 확인하는 핵심 값입니다.
     */
    @Column(nullable = false, length = 100)
    private String providerId;

    @Builder
    public SocialAccount(User user, String provider, String providerId) {
        this.user = user;
        this.provider = provider;
        this.providerId = providerId;
    }
}
