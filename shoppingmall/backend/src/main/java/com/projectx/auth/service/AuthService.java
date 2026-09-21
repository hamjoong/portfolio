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

        try {
            String encryptedProfile = kmsService.encryptMap(createProfileMap(request));
            UserProfile profile = UserProfile.builder()
                    .userId(savedUser.getId())
                    .encryptedData(encryptedProfile)
                    .kmsKeyId(kmsKeyId)
                    .build();
            userProfileRepository.save(profile);
        } catch (Exception e) {
            log.error("[Auth] Failed to encrypt user profile for user: {}", savedUser.getId(), e);
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
        }

        log.info("[Auth] Success signup for user: {}", savedUser.getId());
        return savedUser.getId();
    }

    /**
     * 이름과 전화번호로 이메일(아이디)을 찾습니다.
     * [수정] UserProfile의 PK가 userId이므로, profile.getUserId()로 직접 User를 조회합니다.
     * (암호화된 맵에는 userId 키가 없어 map.get("userId")는 항상 null을 반환하는 버그 수정)
     */
    @Transactional(readOnly = true)
    public String findEmail(String fullName, String phoneNumber) {
        return userProfileRepository.findAll().stream()
                .filter(profile -> {
                    try {
                        Map<String, Object> map = kmsService.decryptToMap(profile.getEncryptedData());
                        return map != null
                                && fullName.equals(map.get("fullName"))
                                && phoneNumber.equals(map.get("phoneNumber"));
                    } catch (Exception e) {
                        return false;
                    }
                })
                .map(profile -> userRepository.findById(profile.getUserId()).orElse(null))
                .filter(user -> user != null)
                .map(User::getEmail)
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * 비밀번호 찾기 - 이름/전화번호 검증 후 임시 비밀번호를 생성하여 반환합니다.
     * [수정] 임시 비밀번호를 String으로 반환하여 프론트엔드에서 사용자에게 직접 표시합니다.
     */
    @Transactional
    public String findPassword(String email, String fullName, String phoneNumber) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 프로필 정보 검증
        UserProfile profile = userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        try {
            Map<String, Object> map = kmsService.decryptToMap(profile.getEncryptedData());
            if (!fullName.equals(map.get("fullName")) || !phoneNumber.equals(map.get("phoneNumber"))) {
                throw new BusinessException(ErrorCode.USER_NOT_FOUND);
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
        }

        // 임시 비밀번호 생성 후 저장하고 반환 (프론트엔드에서 사용자에게 표시)
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(passwordEncoder.encode(tempPassword));
        log.info("[Auth] Temporary password generated for user: {}", user.getId());
        return tempPassword;
    }

    private Map<String, Object> createProfileMap(SignupRequest request) {
        Map<String, Object> profileMap = new java.util.HashMap<>();
        profileMap.put("fullName", request.getFullName());
        profileMap.put("phoneNumber", request.getPhoneNumber());
        profileMap.put("address", request.getAddress());
        profileMap.put("detailAddress", request.getDetailAddress());
        return profileMap;
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
