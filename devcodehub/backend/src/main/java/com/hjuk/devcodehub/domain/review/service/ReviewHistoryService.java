package com.hjuk.devcodehub.domain.review.service;

import com.hjuk.devcodehub.domain.review.domain.Review;
import com.hjuk.devcodehub.domain.review.dto.AiReviewRequest;
import com.hjuk.devcodehub.domain.review.repository.ReviewRepository;
import com.hjuk.devcodehub.domain.user.domain.User;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ReviewHistoryService {
  private final ReviewRepository reviewRepository;

  private static final int SUMMARY_MAX_LENGTH = 50;
  private static final int SUMMARY_TRUNCATE_LENGTH = 47;

  public void saveReview(
      AiReviewRequest request, String modelName, Map<String, Object> result, User author) {
    try {
      String summary = (String) result.getOrDefault("summary", "AI 코드 리뷰 결과입니다.");
      Review review =
          Review.builder()
              .title(
                  summary.length() > SUMMARY_MAX_LENGTH
                      ? summary.substring(0, SUMMARY_TRUNCATE_LENGTH) + "..."
                      : summary)
              .codeContent(request.getCode())
              .language(
                  request.getLanguage() != null
                      ? request.getLanguage()
                      : (String) result.getOrDefault("language", "unknown"))
              .modelName(modelName)
              .structuredResult(result)
              .aiResult(result.toString())
              .author(author)
              .build();
      reviewRepository.save(review);
    } catch (Exception e) {
      log.error("Failed to save review history to DB for model {}: {}", modelName, e.getMessage());
    }
  }
}
