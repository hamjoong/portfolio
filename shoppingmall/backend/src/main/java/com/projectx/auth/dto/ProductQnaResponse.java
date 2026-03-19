package com.projectx.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String productName;
    private String productImageUrl;
    private String title;
    private String content;
    private String answer;
    
    @JsonProperty("isAnswered")
    private boolean isAnswered;
    
    private LocalDateTime createdAt;

    public static ProductQnaResponse from(ProductQna qna, String productName, String productImageUrl) {
        return ProductQnaResponse.builder()
                .id(qna.getId())
                .productId(qna.getProductId())
                .productName(productName)
                .productImageUrl(productImageUrl)
                .title(qna.getTitle())
                .content(qna.getContent())
                .answer(qna.getAnswer())
                .isAnswered(qna.isAnswered())
                .createdAt(qna.getCreatedAt())
                .build();
    }
}
