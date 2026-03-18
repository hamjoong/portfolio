package com.projectx.auth.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 상품 리뷰를 관리하는 엔티티입니다.
 * [이유] 구매자가 상품에 대한 평가와 사진을 남길 수 있도록 하여 
 * 다른 구매자의 의사결정을 돕고 상품 신뢰도를 높이기 위함입니다.
 */
@Entity
@Table(name = "reviews")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private UUID orderId;

    @Column(nullable = false)
    private int rating; // 1~5점

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 1000)
    private String imageUrl; // S3 업로드된 이미지 URL

    @Column(columnDefinition = "TEXT")
    private String adminReply;

    private LocalDateTime repliedAt;

    /**
     * 리뷰 내용을 수정합니다.
     */
    public void updateReview(int rating, String content, String imageUrl) {
        this.rating = rating;
        this.content = content;
        this.imageUrl = imageUrl;
    }

    /**
     * 관리자 답변을 등록하거나 수정합니다.
     */
    public void updateReply(String adminReply) {
        this.adminReply = adminReply;
        this.repliedAt = LocalDateTime.now();
    }
}
