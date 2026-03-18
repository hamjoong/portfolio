package com.projectx.auth.controller;

import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.UpdateProfileRequest;
import com.projectx.auth.dto.UserProfileResponse;
import com.projectx.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 사용자 정보 관리(마이페이지 등)를 위한 API 엔드포인트를 제공하는 컨트롤러입니다.
 * [이유] 인증된 사용자의 식별 정보(JWT)를 기반으로 개인정보 조회 및 수정 기능을
 * 안전하게 제공하기 위함입니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 현재 로그인한 사용자의 프로필 정보를 조회합니다.
     * [이유] 본인의 개인정보를 마이페이지 등에서 확인하기 위해 암호화된 데이터를 복호화하여 전달하기 위함입니다.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(@AuthenticationPrincipal String userId) {
        log.info("[User] Fetching profile for user: {}", userId);
        UserProfileResponse response = userService.getUserProfile(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 사용자의 프로필 정보를 수정합니다.
     * [이유] 변경된 실명이나 연락처를 전달받아 KMS 암호화를 거쳐 안전하게 업데이트하기 위함입니다.
     */
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<String>> updateMyProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        log.info("[User] Updating profile for user: {}", userId);
        userService.updateUserProfile(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success("프로필 정보가 성공적으로 업데이트되었습니다."));
    }
}
