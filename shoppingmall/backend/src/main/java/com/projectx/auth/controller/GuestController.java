package com.projectx.auth.controller;

import com.projectx.auth.service.GuestAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 비회원 인증 관련 API를 제공하는 컨트롤러입니다.
 * [이유] 전환율 향상을 위해 비회원 구매(Guest Checkout) 흐름의 시작점 역할을 수행합니다.
 */
@RestController
@RequestMapping("/api/v1/guest")
@RequiredArgsConstructor
public class GuestController {

    private final GuestAuthService guestAuthService;

    @PostMapping("/auth")
    public ResponseEntity<?> authenticateGuest() {
        String token = guestAuthService.createGuestSession();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of("accessToken", token),
            "error", null
        ));
    }
}
