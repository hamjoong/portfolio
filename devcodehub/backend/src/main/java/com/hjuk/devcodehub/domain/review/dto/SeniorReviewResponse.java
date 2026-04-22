package com.hjuk.devcodehub.domain.review.dto;

import com.hjuk.devcodehub.domain.review.domain.SeniorReviewRequest;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SeniorReviewResponse {
  private Long id;
  private String title;
  private String content;
  private String codeContent;
  private String language;
  private List<String> tags;
  private int credits;
  private SeniorReviewStatus status;
  private String juniorNickname;
  private String juniorLoginId;
  private String seniorNickname;
  private String seniorLoginId;
  private LocalDateTime createdAt;
  private long applicationCount;

  public SeniorReviewResponse(SeniorReviewRequest request, long inputApplicationCount) {
    this.id = request.getId();
    this.title = request.getTitle();
    this.content = request.getContent();
    this.codeContent = request.getCodeContent();
    this.language = request.getLanguage();
    this.tags = request.getTags();
    this.credits = request.getCredits();
    this.status = request.getStatus();
    this.juniorNickname = request.getJunior().getNickname();
    this.juniorLoginId = request.getJunior().getLoginId();
    if (request.getSenior() != null) {
      this.seniorNickname = request.getSenior().getNickname();
      this.seniorLoginId = request.getSenior().getLoginId();
    }
    this.createdAt = request.getCreatedAt();
    this.applicationCount = inputApplicationCount;
  }
}
