package com.hjuk.devcodehub.domain.review.dto;

import com.hjuk.devcodehub.domain.review.domain.SeniorReviewApplication;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SeniorReviewApplicationResponse {
  private Long id;
  private Long requestId;
  private String seniorNickname;
  private String seniorLoginId;
  private String message;
  private LocalDateTime createdAt;

  public SeniorReviewApplicationResponse(SeniorReviewApplication application) {
    this.id = application.getId();
    this.requestId = application.getRequest().getId();
    this.seniorNickname = application.getSenior().getNickname();
    this.seniorLoginId = application.getSenior().getLoginId();
    this.message = application.getMessage();
    this.createdAt = application.getCreatedAt();
  }
}
