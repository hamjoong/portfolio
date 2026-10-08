package com.hjuk.devcodehub.domain.review.dto;

import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SeniorReviewRequestDto {
  private String title;
  private String content;
  private String codeContent;
  private String language;
  private List<String> tags;
  private int credits;
}
