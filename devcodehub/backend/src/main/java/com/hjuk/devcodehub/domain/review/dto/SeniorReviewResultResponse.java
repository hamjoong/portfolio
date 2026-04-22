package com.hjuk.devcodehub.domain.review.dto;

import com.hjuk.devcodehub.domain.review.domain.SeniorReview;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SeniorReviewResultResponse {
  private Long id;
  private String content;
  private int rating;
  private String seniorNickname;
  private LocalDateTime createdAt;

  public SeniorReviewResultResponse(SeniorReview review) {
    this.id = review.getId();
    this.content = review.getContent();
    this.rating = review.getRating();
    this.seniorNickname = review.getSenior().getNickname();
    this.createdAt = review.getCreatedAt();
  }
}
