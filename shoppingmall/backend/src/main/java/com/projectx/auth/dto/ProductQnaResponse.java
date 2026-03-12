package com.projectx.auth.dto;

import com.projectx.auth.domain.entity.ProductQna;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ProductQnaResponse {
    private UUID id;
    private UUID productId;
    private String title;
    private String content;
    private String answer;
    private boolean isAnswered;
    private LocalDateTime createdAt;

    public static ProductQnaResponse from(ProductQna qna) {
        return ProductQnaResponse.builder()
                .id(qna.getId())
                .productId(qna.getProductId())
                .title(qna.getTitle())
                .content(qna.getContent())
                .answer(qna.getAnswer())
                .isAnswered(qna.isAnswered())
                .createdAt(qna.getCreatedAt())
                .build();
    }
}
