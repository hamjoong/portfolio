package com.projectx.auth.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * JWT(JSON Web Token)의 생성, 추출, 검증을 담당하는 유틸리티 클래스입니다.
 * [이유] 서버가 상태를 저장하지 않고도 클라이언트의 신원을 안전하게 확인할 수 있는 수단을 제공하여
 * 서비스의 확장성과 보안성을 동시에 확보하기 위함입니다.
 */
@Slf4j
@Component
public class JwtProvider {

    @Value("${jwt.secret-key:v-this-is-a-sample-secret-key-for-shopping-mall-2026-must-be-long}")
    private String secretKeyPlain;

    @Value("${jwt.access-token-expiration:3600000}")
    private long accessTokenExpiration;

    private SecretKey key;

    /**
     * 환경 설정에서 읽어온 비밀키를 HMAC SHA 알고리즘에 적합한 형태로 변환합니다.
     * [이유] 보안상 안전한 형태의 키를 사용하여 토큰의 위변조를 원천적으로 차단하기 위함입니다.
     */
    @PostConstruct
    protected void init() {
        this.key = Keys.hmacShaKeyFor(secretKeyPlain.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 사용자의 식별 정보(ID)와 역할을 담은 Access Token을 생성합니다.
     * [이유] 1시간이라는 짧은 유효시간을 설정하여 토큰 탈취 시의 피해를 최소화하고,
     * 매 요청마다 사용자를 인증하기 위한 용도로 활용합니다.
     */
    public String createAccessToken(UUID userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * 비회원(GUEST)을 위한 임시 토큰을 생성합니다.
     * [이유] 회원가입 없이도 장바구니나 주문 절차를 진행할 수 있도록 임시 식별자를 부여하기 위함입니다.
     */
    public String createGuestToken(UUID guestId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration); // 비회원도 동일한 만료 시간 적용

        return Jwts.builder()
                .subject(guestId.toString())
                .claim("role", "ROLE_GUEST")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * 토큰에서 사용자 ID를 추출합니다.
     * [이유] 요청마다 전달된 토큰의 유효성을 검증하고, 해당 요청을 수행하는 주체가
     * 누구인지 식별하여 비즈니스 로직을 처리하기 위함입니다.
     */
    public String getUserIdFromToken(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * 토큰에서 역할을 추출합니다.
     * [이유] Spring Security 권한 부여 로직에서 활용하기 위함입니다.
     */
    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 토큰의 유효성을 검사합니다.
     * [이유] 만료된 토큰이나 변조된 토큰을 사전에 차단하여 보호된 자원에 대한
     * 비정상적인 접근을 방지하기 위함입니다.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            log.warn("[JWT] Invalid token: {}", e.getMessage());
            return false;
        }
    }
}
