package com.projectx.auth.controller;

import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.ReviewRequest;
import com.projectx.auth.dto.ReviewResponse;
import com.projectx.auth.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 상품 리뷰 API를 제공하는 컨트롤러입니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 새로운 리뷰를 작성합니다.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UUID>> createReview(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody ReviewRequest request) {
        log.info("[Review] Creating review for user: {}, product: {}", userId, request.getProductId());
        UUID reviewId = reviewService.createReview(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success("리뷰가 등록되었습니다.", reviewId));
    }

    /**
     * 특정 상품의 모든 리뷰를 조회합니다.
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getProductReviews(
            @PathVariable UUID productId,
            Pageable pageable) {
        Page<ReviewResponse> reviews = reviewService.getProductReviews(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    /**
     * 내가 작성한 리뷰 목록을 조회합니다.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal String userId,
            Pageable pageable) {
        Page<ReviewResponse> reviews = reviewService.getMyReviews(UUID.fromString(userId), pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    /**
     * 리뷰를 수정합니다.
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> updateReview(
            @AuthenticationPrincipal String userId,
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReviewRequest request) {
        reviewService.updateReview(UUID.fromString(userId), reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("리뷰가 수정되었습니다.", null));
    }

    /**
     * 리뷰를 삭제합니다.
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @AuthenticationPrincipal String userId,
            @PathVariable UUID reviewId) {
        reviewService.deleteReview(UUID.fromString(userId), reviewId);
        return ResponseEntity.ok(ApiResponse.success("리뷰가 삭제되었습니다.", null));
    }

    /**
     * [관리자] 리뷰에 답변을 등록합니다.
     */
    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ApiResponse<Void>> replyReview(
            @PathVariable UUID reviewId,
            @RequestBody com.projectx.auth.dto.AdminReplyRequest request) {
        log.info("[Admin] Replying to review: {}", reviewId);
        reviewService.addAdminReply(reviewId, request.getContent());
        return ResponseEntity.ok(ApiResponse.success("답변이 등록되었습니다.", null));
    }
}
