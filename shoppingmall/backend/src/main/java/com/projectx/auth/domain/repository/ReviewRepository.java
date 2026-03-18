package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    /**
     * 특정 상품의 모든 리뷰를 최신순으로 조회합니다.
     */
    Page<Review> findByProductId(UUID productId, Pageable pageable);

    /**
     * 특정 사용자가 작성한 모든 리뷰를 조회합니다.
     */
    Page<Review> findByUserId(UUID userId, Pageable pageable);

    /**
     * 특정 주문과 연관된 리뷰가 존재하는지 확인합니다.
     */
    boolean existsByOrderIdAndProductId(UUID orderId, UUID productId);
}
