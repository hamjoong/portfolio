package com.hjuk.devcodehub.domain.review.controller;

import com.hjuk.devcodehub.domain.review.domain.Review;
import com.hjuk.devcodehub.domain.review.dto.AiReviewRequest;
import com.hjuk.devcodehub.domain.review.repository.ReviewRepository;
import com.hjuk.devcodehub.domain.review.service.AiReviewService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewRepository reviewRepository;
  private final AiReviewService aiReviewService;

  @PostMapping("/ai")
  public ResponseEntity<ApiResponse<Map<String, Object>>> requestAiReview(
      @RequestBody AiReviewRequest request,
      @AuthenticationPrincipal User user,
      HttpServletRequest httpServletRequest) {

    String loginId = user != null ? user.getUsername() : null;
    String ipAddress = httpServletRequest.getRemoteAddr();
    boolean isGuest = (user == null);

    return ResponseEntity.ok(
        ApiResponse.success(aiReviewService.requestAiReview(request, loginId, ipAddress, isGuest)));
  }

  @GetMapping("/ai/guest-usage")
  public ResponseEntity<ApiResponse<Integer>> getGuestUsage(HttpServletRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(aiReviewService.getGuestUsage(request.getRemoteAddr())));
  }

  @GetMapping("/history")
  public ResponseEntity<ApiResponse<Page<ReviewHistoryResponse>>> getReviewHistory(
      @AuthenticationPrincipal User user,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {

    if (user == null) {
      return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
    }

    Page<Review> reviews =
        reviewRepository.findByAuthorLoginIdOrderByCreatedAtDesc(
            user.getUsername(), PageRequest.of(page, size));

    return ResponseEntity.ok(ApiResponse.success(reviews.map(ReviewHistoryResponse::new)));
  }

  @Cacheable(value = "latestReviews", key = "#size")
  @GetMapping("/latest")
  public ResponseEntity<List<ReviewResponse>> getLatestReviews(
      @RequestParam(defaultValue = "3") int size) {
    Page<Review> reviews = reviewRepository.findLatestReviews(PageRequest.of(0, size));
    return ResponseEntity.ok(
        reviews.getContent().stream().map(ReviewResponse::new).collect(Collectors.toList()));
  }

  @lombok.Getter
  public static class ReviewResponse {
    private Long id;
    private String title;

    public ReviewResponse(Review review) {
      this.id = review.getId();
      this.title = review.getTitle();
    }
  }

  @lombok.Getter
  public static class ReviewHistoryResponse {
    private Long id;
    private String title;
    private String language;
    private String modelName;
    private Map<String, Object> result;
    private java.time.LocalDateTime createdAt;

    public ReviewHistoryResponse(Review review) {
      this.id = review.getId();
      this.title = review.getTitle();
      this.language = review.getLanguage();
      this.modelName = review.getModelName();
      this.result = review.getStructuredResult();
      this.createdAt = review.getCreatedAt();
    }
  }
}
