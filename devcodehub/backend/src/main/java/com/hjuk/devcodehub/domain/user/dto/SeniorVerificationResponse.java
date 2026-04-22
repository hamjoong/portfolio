package com.hjuk.devcodehub.domain.user.dto;

import com.hjuk.devcodehub.domain.user.domain.SeniorVerification;
import com.hjuk.devcodehub.domain.user.domain.VerificationStatus;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SeniorVerificationResponse {
  private Long id;
  private String userLoginId;
  private String userNickname;
  private String githubUrl;
  private String linkedInUrl;
  private String blogUrl;
  private String careerSummary;
  private VerificationStatus status;
  private String rejectionReason;
  private LocalDateTime createdAt;

  public SeniorVerificationResponse(SeniorVerification verification) {
    this.id = verification.getId();
    this.userLoginId = verification.getUser().getLoginId();
    this.userNickname = verification.getUser().getNickname();
    this.githubUrl = verification.getGithubUrl();
    this.linkedInUrl = verification.getLinkedInUrl();
    this.blogUrl = verification.getBlogUrl();
    this.careerSummary = verification.getCareerSummary();
    this.status = verification.getStatus();
    this.rejectionReason = verification.getRejectionReason();
    this.createdAt = verification.getCreatedAt();
  }
}
