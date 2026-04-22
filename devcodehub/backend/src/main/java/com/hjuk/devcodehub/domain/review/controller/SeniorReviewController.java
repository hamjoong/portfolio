package com.hjuk.devcodehub.domain.review.controller;

import com.hjuk.devcodehub.domain.review.domain.SeniorReviewStatus;
import com.hjuk.devcodehub.domain.review.dto.SeniorReviewApplicationResponse;
import com.hjuk.devcodehub.domain.review.dto.SeniorReviewRequestDto;
import com.hjuk.devcodehub.domain.review.dto.SeniorReviewResponse;
import com.hjuk.devcodehub.domain.review.dto.SeniorReviewResultResponse;
import com.hjuk.devcodehub.domain.review.service.SeniorReviewService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reviews/senior")
@RequiredArgsConstructor
public class SeniorReviewController {

  private static final int DEFAULT_PAGE_SIZE = 10;
  private final SeniorReviewService seniorReviewService;

  @PostMapping("/requests")
  public ResponseEntity<ApiResponse<Long>> createRequest(
      @RequestBody SeniorReviewRequestDto dto, @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(
        ApiResponse.success(seniorReviewService.createRequest(dto, user.getUsername())));
  }

  @GetMapping("/requests")
  public ResponseEntity<ApiResponse<Page<SeniorReviewResponse>>> getRequests(
      @RequestParam(required = false) SeniorReviewStatus status,
      @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    return ResponseEntity.ok(
        ApiResponse.success(seniorReviewService.getRequests(status, pageable)));
  }

  @GetMapping("/requests/{id}")
  public ResponseEntity<ApiResponse<SeniorReviewResponse>> getRequestDetail(@PathVariable Long id) {
    return ResponseEntity.ok(ApiResponse.success(seniorReviewService.getRequestDetail(id)));
  }

  @PostMapping("/requests/{id}/apply")
  public ResponseEntity<ApiResponse<Void>> applyForRequest(
      @PathVariable Long id,
      @RequestBody Map<String, String> body,
      @AuthenticationPrincipal User user) {
    seniorReviewService.applyForRequest(id, user.getUsername(), body.get("message"));
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @GetMapping("/requests/{id}/applications")
  public ResponseEntity<ApiResponse<List<SeniorReviewApplicationResponse>>> getApplications(
      @PathVariable Long id, @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(
        ApiResponse.success(seniorReviewService.getApplications(id, user.getUsername())));
  }

  @PostMapping("/requests/{id}/applications/{applicationId}/accept")
  public ResponseEntity<ApiResponse<Void>> acceptApplication(
      @PathVariable Long id, @PathVariable Long applicationId, @AuthenticationPrincipal User user) {
    seniorReviewService.acceptApplication(id, applicationId, user.getUsername());
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @PostMapping("/requests/{id}/complete")
  public ResponseEntity<ApiResponse<Void>> completeReview(
      @PathVariable Long id,
      @RequestBody Map<String, String> body,
      @AuthenticationPrincipal User user) {
    seniorReviewService.completeReview(id, user.getUsername(), body.get("content"));
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @GetMapping("/requests/{id}/result")
  public ResponseEntity<ApiResponse<SeniorReviewResultResponse>> getReviewResult(
      @PathVariable Long id) {
    return ResponseEntity.ok(ApiResponse.success(seniorReviewService.getReviewResult(id)));
  }

  @PostMapping("/requests/{id}/rate")
  public ResponseEntity<ApiResponse<Void>> rateReview(
      @PathVariable Long id,
      @RequestBody Map<String, Integer> body,
      @AuthenticationPrincipal User user) {
    seniorReviewService.rateReview(id, user.getUsername(), body.get("rating"));
    return ResponseEntity.ok(ApiResponse.success(null));
  }
}
