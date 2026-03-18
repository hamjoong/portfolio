package com.projectx.auth.service;

import com.projectx.auth.config.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * 비회원(Guest) 인증을 전담하는 서비스입니다.
 * [이유] 회원가입 없이 쇼핑을 시작하는 사용자에게 임시 ID와 토큰을 발급하여
 * 장바구니나 주문 기능을 사용할 수 있는 최소한의 권한을 부여하기 위함입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GuestAuthService {

    private final JwtProvider jwtProvider;

    /**
     * 새로운 비회원 식별자와 토큰을 생성합니다.
     */
    public String createGuestSession() {
        UUID guestId = UUID.randomUUID();
        String token = jwtProvider.createGuestToken(guestId);
        log.info("[Guest] New session created: {}", guestId);
        return token;
    }
}
