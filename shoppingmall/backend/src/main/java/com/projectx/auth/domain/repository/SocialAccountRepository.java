package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.SocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 소셜 연동 정보를 데이터베이스에서 관리하는 인터페이스입니다.
 * [이유] 외부 인증 수단(Provider + ProviderId)과 연동된 서비스 내부 유저를 식별하여
 * 소셜 로그인 시 동일한 사용자로 매핑하기 위함입니다.
 */
public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    /**
     * 제공자 이름과 고유 ID로 소셜 계정을 조회합니다.
     * [이유] 중복 가입 여부를 확인하고, 소셜 로그인 시 연동된 유저를 신속하게 찾기 위함입니다.
     */
    Optional<SocialAccount> findByProviderAndProviderId(String provider, String providerId);
}
