package com.hjuk.devcodehub.global.security.config;

import com.hjuk.devcodehub.global.security.jwt.JwtAuthenticationFilter;
import com.hjuk.devcodehub.global.security.jwt.JwtProvider;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtProvider jwtProvider;
  private final com.hjuk.devcodehub.global.security.oauth2.CustomOAuth2UserService
      customOAuth2UserService;
  private final com.hjuk.devcodehub.global.security.oauth2.OAuth2SuccessHandler
      oAuth2SuccessHandler;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .formLogin(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable)
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/api/v1/ws-stomp/**", "/uploads/**", "/uploads/profiles/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/reviews/ai")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/boards/*/views")
                    .permitAll()
                    .requestMatchers("/error", "/*.ico", "/*.json", "/*.js", "/*.css", "/assets/**", "/index.html")
                    .permitAll()
                    .requestMatchers(
                        "/",
                        "/static/**",
                        "/h2-console/**",
                        "/api/v1/auth/**",
                        "/api/v1/oauth2/**",
                        "/oauth2/**",
                        "/login/oauth2/**",
                        "/health")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/boards/**")
                    .hasAnyRole("USER", "SENIOR", "ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/boards/**")
                    .hasAnyRole("USER", "SENIOR", "ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/boards/**")
                    .hasAnyRole("USER", "SENIOR", "ADMIN")
                    .requestMatchers("/api/v1/admin/**")
                    .hasRole("ADMIN")
                    .anyRequest()
                    .authenticated())
        .exceptionHandling(
            exception ->
                exception.authenticationEntryPoint(
                    (request, response, authException) -> {
                      response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                    }))
        .addFilterBefore(
            new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(
            new com.hjuk.devcodehub.global.security.filter.RateLimitFilter(),
            JwtAuthenticationFilter.class)
        .oauth2Login(
            oauth2 ->
                oauth2
                    .authorizationEndpoint(auth -> auth.baseUri("/api/v1/oauth2/authorization"))
                    .redirectionEndpoint(redirection -> redirection.baseUri("/api/v1/login/oauth2/code/*"))
                    .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                    .successHandler(oAuth2SuccessHandler));

    http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

    return http.build();
  }

  @Value("${CORS_ALLOWED_ORIGIN:http://localhost:5173}")
  private String allowedOrigin;

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(allowedOrigin.split(",")));
    configuration.setAllowedMethods(
        Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
