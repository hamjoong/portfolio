package com.projectx.auth.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 사용자 기본 정보를 관리하는 핵심 엔티티입니다.
 * [리팩토링] 권한 정보를 상수로 관리하고, 도메인 핵심 규칙(어드민 확인 등)을 엔티티 내부에 캡슐화했습니다.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = UserRoles.ROLE_USER;

    private LocalDateTime lastLoginAt;

    /**
     * 마지막 로그인 시간을 갱신합니다.
     */
    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    /**
     * 관리자 권한 여부를 확인합니다.
     */
    public boolean isAdmin() {
        return UserRoles.ROLE_ADMIN.equals(this.role);
    }

    /**
     * 비회원 여부를 확인합니다.
     */
    public boolean isGuest() {
        return UserRoles.ROLE_GUEST.equals(this.role) || UserStatus.GUEST.equals(this.status);
    }
}
