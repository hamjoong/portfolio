package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * User 엔티티에 대한 데이터베이스 접근을 담당하는 인터페이스입니다.
 * [이유] JPA에서 제공하는 표준 메서드와 커스텀 쿼리를 통해 사용자 정보를 효율적으로 조회하고,
 * 서비스 레이어에 필요한 데이터를 공급하기 위함입니다.
 */
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * 이메일을 통해 사용자를 조회합니다.
     * [이유] 이메일은 사용자를 식별하는 고유한 수단(Login ID)이므로,
     * 로그인 및 회원가입 중복 확인 시 핵심적인 역할을 수행하기 때문입니다.
     */
    Optional<User> findByEmail(String email);

    /**
     * 해당 이메일이 이미 존재하는지 확인합니다.
     * [이유] 회원가입 시 중복된 이메일 사용을 방지하여 데이터의 유일성을 보장하기 위함입니다.
     */
    boolean existsByEmail(String email);
}
