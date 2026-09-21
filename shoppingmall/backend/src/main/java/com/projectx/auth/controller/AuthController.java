package com.projectx.auth.controller;

import com.projectx.auth.dto.SignupRequest;
import com.projectx.auth.dto.LoginRequest;
import com.projectx.auth.dto.AuthResponse;
import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.FindEmailRequest;
import com.projectx.auth.dto.FindPasswordRequest;
import com.projectx.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * 인증 및 회원 관리를 위한 API 컨트롤러입니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입을 처리합니다.
     * [이유] 표준화된 ApiResponse 형식을 사용하여 클라이언트와의 통신 규약을 일원화하기 위함입니다.
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UUID>> signup(@Valid @RequestBody SignupRequest request) {
        UUID userId = authService.signup(request);
        return ResponseEntity.ok(ApiResponse.success("회원가입이 성공적으로 완료되었습니다.", userId));
    }

    /**
     * 일반 로그인을 처리합니다.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse.Data>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse.Data loginData = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success("로그인에 성공하였습니다.", loginData));
    }

    /**
     * 아이디 찾기 API
     */
    @PostMapping("/find-email")
    public ResponseEntity<ApiResponse<String>> findEmail(@Valid @RequestBody FindEmailRequest request) {
        String email = authService.findEmail(request.getFullName(), request.getPhoneNumber());
        return ResponseEntity.ok(ApiResponse.success("아이디 찾기에 성공하였습니다.", email));
    }

    /**
     * 비밀번호 찾기 API
     */
    @PostMapping("/find-password")
    public ResponseEntity<ApiResponse<String>> findPassword(@Valid @RequestBody FindPasswordRequest request) {
        String tempPassword = authService.findPassword(request.getEmail(), request.getFullName(), request.getPhoneNumber());
        return ResponseEntity.ok(ApiResponse.success("임시 비밀번호가 발급되었습니다.", tempPassword));
    }
}
