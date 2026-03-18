package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * UserProfile 엔티티에 대한 데이터베이스 접근을 담당하는 인터페이스입니다.
 * [이유] 암호화된 민감 정보(privacy 스키마)에 접근하여 개인정보를 관리하고,
 * 특정 유저의 프로필 정보를 안전하게 저장/조회하기 위함입니다.
 */
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    // [참고] User와 1:1 관계이므로 기본 제공되는 findById(UUID id)를 사용합니다.
}
