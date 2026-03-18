package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 배송지 엔티티에 대한 데이터 액세스 계층입니다.
 */
public interface AddressRepository extends JpaRepository<Address, UUID> {
    
    /**
     * 특정 사용자의 모든 배송지 목록을 조회합니다.
     */
    List<Address> findAllByUserIdOrderByIsDefaultDescCreatedAtDesc(UUID userId);

    /**
     * 특정 사용자의 기본 배송지를 조회합니다.
     */
    Optional<Address> findByUserIdAndIsDefaultTrue(UUID userId);
}
