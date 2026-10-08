package com.hjuk.devcodehub.domain.review.dto;

import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AiReviewRequest {
  private String code;
  private String language;
  private List<String> models; // openai, claude, gemini
}
