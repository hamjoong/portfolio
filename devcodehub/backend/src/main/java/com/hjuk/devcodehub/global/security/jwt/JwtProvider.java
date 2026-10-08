package com.hjuk.devcodehub.global.security.jwt;

import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtProvider {

  @Value("${jwt.secret}")
  private String salt;

  @Value("${jwt.expiration}")
  private long expiration;

  private SecretKey secretKey;
  private final UserRepository userRepository;

  @PostConstruct
  protected void init() {
    secretKey = Keys.hmacShaKeyFor(salt.getBytes(StandardCharsets.UTF_8));
  }

  public String createToken(String loginId, String role) {
    Date now = new Date();
    String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;

    return Jwts.builder()
        .subject(loginId)
        .claim("role", authority)
        .issuedAt(now)
        .expiration(new Date(now.getTime() + expiration))
        .signWith(secretKey)
        .compact();
  }

  public Authentication getAuthentication(String token) {
    Claims claims =
        Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();

    User user =
        userRepository
            .findByLoginId(claims.getSubject())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    List<SimpleGrantedAuthority> authorities =
        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().getKey()));

    org.springframework.security.core.userdetails.User principal =
        new org.springframework.security.core.userdetails.User(user.getLoginId(), "", authorities);
    return new UsernamePasswordAuthenticationToken(principal, null, authorities);
  }

  /**
   * [Why] 전송된 토큰의 위변조 여부 및 만료 여부를 검증합니다.
   *
   * @param token 검증할 JWT 토큰
   * @return 유효성 여부
   */
  public boolean validateToken(String token) {
    try {
      Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
