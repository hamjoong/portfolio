package com.projectx.auth.service;

import com.projectx.auth.domain.entity.Review;
import com.projectx.auth.domain.repository.ReviewRepository;
import com.projectx.auth.dto.ReviewRequest;
import com.projectx.auth.dto.ReviewResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 상품 리뷰에 대한 비즈니스 로직을 담당하는 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    /**
     * 새로운 리뷰를 작성합니다.
     * [이유] 한 주문에 대해 동일 상품 리뷰를 중복 작성하지 못하도록 검증하고,
     * 작성된 리뷰를 영속화하기 위함입니다.
     */
    @Transactional
    public UUID createReview(UUID userId, ReviewRequest request) {
        if (reviewRepository.existsByOrderIdAndProductId(request.getOrderId(), request.getProductId())) {
            throw new RuntimeException("해당 주문 상품에 대한 리뷰를 이미 작성하셨습니다.");
        }

        Review review = Review.builder()
                .userId(userId)
                .productId(request.getProductId())
                .orderId(request.getOrderId())
                .rating(request.getRating())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("[Review] New review created for product: {}, user: {}", request.getProductId(), userId);
        return savedReview.getId();
    }

    /**
     * 특정 상품의 모든 리뷰를 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(UUID productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(ReviewResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 사용자가 작성한 모든 리뷰를 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(UUID userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ReviewResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 리뷰 정보를 수정합니다.
     */
    @Transactional
    public void updateReview(UUID userId, UUID reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰 정보를 찾을 수 없습니다."));

        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("해당 리뷰를 수정할 권한이 없습니다.");
        }

        review.updateReview(request.getRating(), request.getContent(), request.getImageUrl());
        log.info("[Review] Review updated: {}", reviewId);
    }

    /**
     * 리뷰를 삭제합니다.
     */
    @Transactional
    public void deleteReview(UUID userId, UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰 정보를 찾을 수 없습니다."));

        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("해당 리뷰를 삭제할 권한이 없습니다.");
        }

        reviewRepository.delete(review);
        log.info("[Review] Review deleted: {}", reviewId);
    }
}
