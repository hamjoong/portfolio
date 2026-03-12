package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    /**
     * 특정 사용자의 모든 주문 내역을 조회합니다.
     * [최적화] EntityGraph를 사용하여 OrderItem들을 한 번의 쿼리로 Fetch Join하여 N+1 문제를 방어합니다.
     */
    @EntityGraph(attributePaths = {"orderItems"})
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
