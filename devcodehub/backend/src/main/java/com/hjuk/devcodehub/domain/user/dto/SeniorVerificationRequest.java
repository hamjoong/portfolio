package com.hjuk.devcodehub.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SeniorVerificationRequest {
  private String githubUrl;
  private String linkedInUrl;
  private String blogUrl;

  @NotBlank(message = "경력 요약 및 참여 프로젝트 내용은 필수입니다.")
  private String careerSummary;
}
