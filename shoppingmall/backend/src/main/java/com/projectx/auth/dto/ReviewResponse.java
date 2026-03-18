package com.projectx.auth.dto;

import com.projectx.auth.domain.entity.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 리뷰 정보를 클라이언트에게 전달하기 위한 응답 DTO입니다.
 */
@Getter
@Builder
public class ReviewResponse {
    private UUID id;
    private UUID userId;
    private UUID productId;
    private UUID orderId;
    private int rating;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private String adminReply;
    private LocalDateTime repliedAt;

    /**
     * 엔티티 객체를 DTO 객체로 변환합니다.
     */
    public static ReviewResponse from(Review entity) {
        return ReviewResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .productId(entity.getProductId())
                .orderId(entity.getOrderId())
                .rating(entity.getRating())
                .content(entity.getContent())
                .imageUrl(entity.getImageUrl())
                .createdAt(entity.getCreatedAt())
                .adminReply(entity.getAdminReply())
                .repliedAt(entity.getRepliedAt())
                .build();
    }
}
