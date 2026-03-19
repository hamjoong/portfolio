package com.projectx.auth.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * 상품 문의(Q&A)를 관리하는 엔티티입니다.
 */
@Entity
@Table(name = "product_qnas")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductQna extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Builder.Default
    private boolean isAnswered = false;

    public void addAnswer(String answer) {
        this.answer = answer;
        this.isAnswered = true;
    }
}
