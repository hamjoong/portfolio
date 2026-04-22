package com.hjuk.devcodehub.domain.user.controller;

import com.hjuk.devcodehub.domain.user.dto.AdminBoardResponse;
import com.hjuk.devcodehub.domain.user.dto.SeniorVerificationResponse;
import com.hjuk.devcodehub.domain.user.dto.UserResponse;
import com.hjuk.devcodehub.domain.user.service.AdminService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

  private final AdminService adminService;
  private static final int DEFAULT_PAGE_SIZE = 10;

  @GetMapping("/users")
  public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
      @RequestParam(required = false) String keyword,
      @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(keyword, pageable)));
  }

  @GetMapping("/verifications")
  public ResponseEntity<ApiResponse<List<SeniorVerificationResponse>>> getPendingVerifications() {
    return ResponseEntity.ok(ApiResponse.success(adminService.getPendingVerifications()));
  }

  @PatchMapping("/verifications/{id}/approve")
  public ResponseEntity<ApiResponse<Void>> approveSenior(@PathVariable Long id) {
    adminService.approveSenior(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @PatchMapping("/verifications/{id}/reject")
  public ResponseEntity<ApiResponse<Void>> rejectSenior(
      @PathVariable Long id, @RequestBody Map<String, String> body) {
    adminService.rejectSenior(id, body.getOrDefault("reason", "조건 미달"));
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @PostMapping("/users/{loginId}/adjust-credits")
  public ResponseEntity<ApiResponse<Void>> adjustCredits(
      @PathVariable String loginId,
      @RequestBody @jakarta.validation.Valid
          com.hjuk.devcodehub.domain.user.dto.AdminCreditRequest request,
      @AuthenticationPrincipal User admin) {
    adminService.adjustCredits(
        loginId, request.getAmount(), request.getReason(), admin.getUsername());
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @PostMapping("/reviews/{requestId}/cancel")
  public ResponseEntity<ApiResponse<Void>> cancelReview(
      @PathVariable Long requestId,
      @RequestBody Map<String, String> body,
      @AuthenticationPrincipal User admin) {
    String reason = body.getOrDefault("reason", "운영자 판단에 의한 취소");
    adminService.cancelReviewAndRefund(requestId, reason, admin.getUsername());
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @DeleteMapping("/boards/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteBoard(
      @PathVariable Long id, @AuthenticationPrincipal User admin) {
    adminService.deleteBoard(id, admin.getUsername());
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @PatchMapping("/comments/{id}/delete")
  public ResponseEntity<ApiResponse<Void>> deleteComment(
      @PathVariable Long id, @AuthenticationPrincipal User admin) {
    adminService.deleteComment(id, admin.getUsername());
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @GetMapping("/logs")
  public ResponseEntity<ApiResponse<Page<com.hjuk.devcodehub.domain.user.dto.AdminLogResponse>>>
      getAuditLogs(
          @RequestParam(required = false) String keyword,
          @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "createdAt", direction = Sort.Direction.DESC)
              Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.success(adminService.getAuditLogs(keyword, pageable)));
  }

  @GetMapping("/boards")
  public ResponseEntity<ApiResponse<Page<AdminBoardResponse>>> getAllBoards(
      @RequestParam(required = false) String keyword,
      @PageableDefault(size = DEFAULT_PAGE_SIZE, sort = "createdAt", direction = Sort.Direction.DESC)
          Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.success(adminService.getAllBoards(keyword, pageable)));
  }
}
