package com.projectx.auth.config;

import com.projectx.auth.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Collections;

/**
 * 서비스의 전반적인 보안 정책을 설정하는 구성 클래스입니다.
 * [이유] 중앙 집중화된 보안 설정을 통해 모든 API의 접근 권한을 명확히 정의하고,
 * 무상태(Stateless) 아키텍처를 강제하여 서버의 확장성을 확보하기 위함입니다.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final InternalApiKeyFilter internalApiKeyFilter; // 내부 서비스 통신 필터
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    /**
     * HTTP 보안 필터 체인을 구성합니다.
     * [이유] 요청의 성격(공개/비공개)에 따라 필터를 적용하고, JWT 및 OAuth2 인증 흐름을
     * 통합적으로 관리하여 보안 취약점을 최소화하기 위함입니다.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/guest/auth").permitAll() // 비회원 인증은 공개
                .requestMatchers("/api/v1/products/**").permitAll() 
                .requestMatchers("/api/v1/categories/**").permitAll() 
                .requestMatchers("/api/v1/qnas/product/**").permitAll() 
                // 주문은 회원(USER) 또는 비회원(GUEST) 모두 접근 가능하도록 설정
                .requestMatchers("/api/v1/orders/**").hasAnyRole("USER", "GUEST") 
                // 어드민 전용 API
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                // 내부 서비스 전용 API
                .requestMatchers("/api/v1/internal/**").hasRole("INTERNAL")
                .requestMatchers("/oauth2/**", "/login/oauth2/code/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() 
                .anyRequest().authenticated()
            )

            // [이유] 소셜 로그인(구글, 카카오)을 통해 사용자 진입 장벽을 낮추고,
            // 사용자 정보를 커스텀 서비스에서 가공하여 성공 핸들러를 통해 JWT를 발급하기 위함입니다.
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(endpoint -> endpoint.baseUri("/oauth2/authorization"))
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2SuccessHandler)
            )

            .addFilterBefore(internalApiKeyFilter, UsernamePasswordAuthenticationFilter.class) // 내부 API 키 필터 먼저 실행
            .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    @Bean
    public CorsConfigurationSource corsConfigurationSource(); {
        CorsConfiguration config = new CorsConfiguration();
        // [CORS 보안 및 호환성 강화]
        // 1. 운영 환경의 다양한 Vercel 서브도메인을 포함하여 명시적으로 허용
        config.setAllowedOriginPatterns(java.util.Arrays.asList(
            "https://shoppingmallfrontend.vercel.app",
            "https://shoppingmall-*.vercel.app",
            "http://localhost:3000"
        ));
        
        // 2. 표준 HTTP 메서드 모두 허용
        config.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // 3. 모든 헤더 허용 (Authorization 등 포함)
        config.setAllowedHeaders(java.util.Arrays.asList("*"));
        
        // 4. 인증 정보 전달 허용 (중요: JWT 쿠키/헤더 사용 시 필수)
        config.setAllowCredentials(true);
        
        // 5. 브라우저 캐시 시간 설정
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로에 동일한 CORS 정책 적용
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder(); {
        return new BCryptPasswordEncoder();
    }
};
