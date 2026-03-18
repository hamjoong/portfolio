package com.projectx.auth.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

/**
 * 리뷰 작성을 위한 요청 DTO입니다.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewRequest {

    @NotNull
    private UUID productId;

    @NotNull
    private UUID orderId;

    @Min(1) @Max(5)
    private int rating;

    @NotBlank
    private String content;

    private String imageUrl;
}
