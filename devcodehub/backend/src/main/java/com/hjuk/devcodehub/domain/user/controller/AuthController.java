package com.hjuk.devcodehub.domain.user.controller;

import com.hjuk.devcodehub.domain.user.dto.FindIdRequest;
import com.hjuk.devcodehub.domain.user.dto.FindPwRequest;
import com.hjuk.devcodehub.domain.user.dto.SignupRequest;
import com.hjuk.devcodehub.domain.user.service.AuthService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/signup")
  public ResponseEntity<ApiResponse<String>> signup(@Valid @RequestBody SignupRequest request) {
    authService.signup(request);
    return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다."));
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<com.hjuk.devcodehub.domain.user.dto.LoginResponse>> login(
      @Valid @RequestBody com.hjuk.devcodehub.domain.user.dto.LoginRequest request) {
    return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
  }

  @GetMapping("/check-id")
  public ResponseEntity<ApiResponse<Boolean>> checkId(@RequestParam String loginId) {
    return ResponseEntity.ok(ApiResponse.success(authService.isLoginIdDuplicate(loginId)));
  }

  @GetMapping("/check-email")
  public ResponseEntity<ApiResponse<Boolean>> checkEmail(@RequestParam String email) {
    return ResponseEntity.ok(ApiResponse.success(authService.isEmailDuplicate(email)));
  }

  @GetMapping("/check-nickname")
  public ResponseEntity<ApiResponse<Boolean>> checkNickname(@RequestParam String nickname) {
    return ResponseEntity.ok(ApiResponse.success(authService.isNicknameDuplicate(nickname)));
  }

  @PostMapping("/find-id")
  public ResponseEntity<ApiResponse<String>> findId(@Valid @RequestBody FindIdRequest request) {
    String maskedId = authService.findId(request);
    return ResponseEntity.ok(ApiResponse.success("찾으시는 아이디는 [" + maskedId + "] 입니다."));
  }

  @PostMapping("/find-pw")
  public ResponseEntity<ApiResponse<String>> resetPassword(
      @Valid @RequestBody FindPwRequest request) {
    String tempPassword = authService.resetPassword(request);
    return ResponseEntity.ok(
        ApiResponse.success("임시 비밀번호가 발급되었습니다: [" + tempPassword + "] \n로그인 후 반드시 비밀번호를 변경해 주세요."));
  }
}
