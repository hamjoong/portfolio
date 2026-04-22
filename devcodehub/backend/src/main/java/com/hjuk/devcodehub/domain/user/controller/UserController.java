package com.hjuk.devcodehub.domain.user.controller;

import com.hjuk.devcodehub.domain.user.dto.UserResponse;
import com.hjuk.devcodehub.domain.user.dto.UserUpdateRequest;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.UserService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** [Why] 사용자 관리 컨트롤러입니다. */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

  private static final int EXP_FACTOR = 100;
  private static final int PERCENT_MULTIPLIER = 100;

  private final UserService userService;
  private final UserRepository userRepository;

  /**
   * [Why] 모든 사용자를 조회합니다.
   *
   * @param user 인증된 사용자 정보
   * @return 사용자의 목록이 포함된 응답 객체
   */
  @GetMapping
  public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
      @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(
        ApiResponse.success(userService.getAllUsersExceptMe(user.getUsername())));
  }

  /**
   * [Why] 본인 정보를 조회합니다.
   *
   * @param user 인증된 사용자 정보
   * @return 사용자 정보 응답 객체
   */
  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserResponse>> getMyInfo(@AuthenticationPrincipal User user) {
    return ResponseEntity.ok(ApiResponse.success(userService.getMyInfo(user.getUsername())));
  }

  /**
   * [Why] 본인 정보를 수정합니다.
   *
   * @param user 인증된 사용자 정보
   * @param request 수정할 정보
   * @return 처리 결과 메시지
   */
  @PutMapping("/me")
  public ResponseEntity<ApiResponse<String>> updateMyInfo(
      @AuthenticationPrincipal User user, @RequestBody UserUpdateRequest request) {
    userService.updateMyInfo(user.getUsername(), request);
    return ResponseEntity.ok(ApiResponse.success("프로필 정보가 수정되었습니다."));
  }

  /**
   * [Why] 프로필 이미지를 업데이트합니다.
   *
   * @param user 인증된 사용자 정보
   * @param file 업로드할 이미지 파일
   * @return 업로드된 이미지 URL
   */
  @PostMapping("/me/image")
  public ResponseEntity<ApiResponse<String>> updateProfileImage(
      @AuthenticationPrincipal User user, @RequestParam("file") MultipartFile file) {
    String imageUrl = userService.updateProfileImage(user.getUsername(), file);
    return ResponseEntity.ok(ApiResponse.success(imageUrl));
  }

  /**
   * [Why] 아바타를 업데이트합니다.
   *
   * @param user 인증된 사용자 정보
   * @param seed 아바타 식별자
   * @return 업데이트된 아바타 URL
   */
  @PatchMapping("/me/avatar")
  public ResponseEntity<ApiResponse<String>> updateAvatar(
      @AuthenticationPrincipal User user, @RequestParam String seed) {
    String avatarUrl = userService.updateAvatar(user.getUsername(), seed);
    return ResponseEntity.ok(ApiResponse.success(avatarUrl));
  }

  /**
   * [Why] 사용자 성장 그래프를 조회합니다.
   *
   * @param user 인증된 사용자 정보
   * @return 사용자 성장 데이터
   */
  @GetMapping("/me/growth-graph")
  public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getGrowthGraph(
      @AuthenticationPrincipal User user) {
    com.hjuk.devcodehub.domain.user.domain.User entity =
        userRepository
            .findByLoginId(user.getUsername())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    java.util.Map<String, Object> graphData =
        java.util.Map.of(
            "level",
            entity.getLevel(),
            "currentExp",
            entity.getExperience(),
            "nextLevelExp",
            entity.getLevel() * EXP_FACTOR,
            "progress",
            (double) entity.getExperience()
                / (entity.getLevel() * EXP_FACTOR)
                * PERCENT_MULTIPLIER);

    return ResponseEntity.ok(ApiResponse.success(graphData));
  }

  /**
   * [Why] 사용자 활동 로그를 조회합니다.
   *
   * @param user 인증된 사용자 정보
   * @return 사용자 활동 로그 목록
   */
  @GetMapping("/me/activity-logs")
  public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> getActivityLogs(
      @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(ApiResponse.success(userService.getActivityLogs(user.getUsername())));
  }

  /**
   * [Why] 시니어 인증을 요청합니다.
   *
   * @param user 인증된 사용자 정보
   * @param request 시니어 인증 요청 데이터
   * @return 응답 객체
   */
  @PostMapping("/me/verify-senior")
  public ResponseEntity<ApiResponse<Void>> requestSeniorVerification(
      @AuthenticationPrincipal User user,
      @jakarta.validation.Valid @RequestBody
          com.hjuk.devcodehub.domain.user.dto.SeniorVerificationRequest request) {
    userService.requestSeniorVerification(user.getUsername(), request);
    return ResponseEntity.ok(ApiResponse.success(null));
  }
}
