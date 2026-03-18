package com.projectx.auth.service;

import com.projectx.auth.config.JwtProvider;
import com.projectx.auth.domain.entity.User;
import com.projectx.auth.domain.entity.UserProfile;
import com.projectx.auth.domain.entity.UserStatus;
import com.projectx.auth.domain.repository.UserProfileRepository;
import com.projectx.auth.domain.repository.UserRepository;
import com.projectx.auth.dto.SignupRequest;
import com.projectx.auth.dto.AuthResponse;
import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.exception.BusinessException;
import com.projectx.auth.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * 인증 및 회원 가입 핵심 비즈니스 로직입니다.
 * [리팩토링] KMS 인프라 로직을 KmsService로 위임하고, 서비스 레이어는 트랜잭션과 비즈니스 흐름에만 집중하도록 개선했습니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final KmsService kmsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Value("${aws.kms.key-id:dummy}")
    private String kmsKeyId;

    /**
     * 회원 가입을 처리합니다. (계정 생성 + 암호화 프로필 생성)
     */
    @Transactional
    public UUID signup(SignupRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        validateDuplicateEmail(normalizedEmail);

        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        User savedUser = userRepository.save(user);

        // Declare and initialize profileMap before the try-catch block
        java.util.Map<String, Object> profileMap = new java.util.HashMap<>();
        profileMap.put("fullName", request.getFullName());
        profileMap.put("phoneNumber", request.getPhoneNumber());
        profileMap.put("address", request.getAddress());
        profileMap.put("detailAddress", request.getDetailAddress());

        String encryptedProfile;
        try {
            encryptedProfile = kmsService.encryptMap(profileMap);
        } catch (Exception e) {
            log.error("[Auth] Failed to encrypt user profile for user: {}", savedUser.getId(), e);
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
        }

        UserProfile profile = UserProfile.builder()
                .userId(savedUser.getId())
                .encryptedData(encryptedProfile)
                .kmsKeyId(kmsKeyId)
                .build();
        userProfileRepository.save(profile);

        log.info("[Auth] Success signup for user: {}", savedUser.getId());
        return savedUser.getId();
    }

    /**
     * 로그인 성공 시 JWT 토큰과 사용자 정보를 반환합니다.
     */
    @Transactional(readOnly = true)
    public AuthResponse.Data login(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_INPUT_INVALID));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(ErrorCode.LOGIN_INPUT_INVALID);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("[Auth] Login denied for inactive user: {}, Status: {}", normalizedEmail, user.getStatus());
            throw new BusinessException(ErrorCode.USER_INACTIVE);
        }

        user.updateLastLogin();
        String token = jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole());
        
        return AuthResponse.Data.builder()
                .userId(user.getId())
                .accessToken(token)
                .role(user.getRole())
                .build();
    }

    private void validateDuplicateEmail(String email) {
        if (userRepository.existsByEmail(email.trim().toLowerCase())) {
            throw new BusinessException(ErrorCode.EMAIL_DUPLICATION);
        }
    }
}
