package com.projectx.auth.service;

import com.projectx.auth.config.JwtProvider;
import com.projectx.auth.domain.entity.User;
import com.projectx.auth.domain.entity.UserProfile;
import com.projectx.auth.domain.entity.UserStatus;
import com.projectx.auth.domain.repository.UserProfileRepository;
import com.projectx.auth.domain.repository.UserRepository;
import com.projectx.auth.dto.SignupRequest;
import com.projectx.auth.dto.AuthResponse;
import com.projectx.auth.exception.BusinessException;
import com.projectx.auth.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * 인증 및 회원 가입 핵심 비즈니스 로직입니다.
 * [리팩토링] KMS 의존성을 제거하고 로컬 EncryptionService로 통합하였습니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final EncryptionService encryptionService;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

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
            String encryptedProfile = encryptionService.encryptMap(createProfileMap(request));
            UserProfile profile = UserProfile.builder()
                    .userId(savedUser.getId())
                    .encryptedData(encryptedProfile)
                    .build();
            userProfileRepository.save(profile);
        } catch (Exception e) {
            log.error("[Auth] Failed to encrypt user profile for user: {}. Exception: {}, Message: {}, Cause: {}", 
                savedUser.getId(), e.getClass().getName(), e.getMessage(), e.getCause());
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
        }

        log.info("[Auth] Success signup for user: {}", savedUser.getId());
        return savedUser.getId();
    }

    /**
     * 이름과 전화번호로 이메일(아이디)을 찾습니다.
     */
    @Transactional(readOnly = true)
    public String findEmail(String fullName, String phoneNumber) {
        return userProfileRepository.findAll().stream()
                .filter(profile -> {
                    try {
                        Map<String, Object> map = encryptionService.decryptToMap(profile.getEncryptedData());
                        boolean match = map != null
                                && fullName.equals(map.get("fullName"))
                                && phoneNumber.equals(map.get("phoneNumber"));
                        if (!match) {
                            log.debug("[Auth] Profile mismatch for user: {}", profile.getUserId());
                        }
                        return match;
                    } catch (Exception e) {
                        log.error("[Auth] Decryption failed for user: {}", profile.getUserId(), e);
                        return false;
                    }
                })
                .map(profile -> userRepository.findById(profile.getUserId()).orElse(null))
                .filter(user -> user != null)
                .map(User::getEmail)
                .findFirst()
                .orElseGet(() -> {
                    log.warn("[Auth] No user found for name: {}, phone: {}", fullName, phoneNumber);
                    throw new BusinessException(ErrorCode.USER_NOT_FOUND);
                });
    }

    /**
     * 비밀번호 찾기 - 이름/전화번호 검증 후 임시 비밀번호를 생성하여 반환합니다.
     */
    @Transactional
    public String findPassword(String email, String fullName, String phoneNumber) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> {
                    log.warn("[Auth] User not found with email: {}", email);
                    return new BusinessException(ErrorCode.USER_NOT_FOUND);
                });

        // 프로필 정보 검증
        UserProfile profile = userProfileRepository.findById(user.getId())
                .orElseThrow(() -> {
                    log.warn("[Auth] Profile not found for user: {}", user.getId());
                    return new BusinessException(ErrorCode.USER_NOT_FOUND);
                });

        try {
            Map<String, Object> map = encryptionService.decryptToMap(profile.getEncryptedData());
            if (!fullName.equals(map.get("fullName")) || !phoneNumber.equals(map.get("phoneNumber"))) {
                log.warn("[Auth] Profile mismatch for user: {}. Expected: {}/{}, Actual: {}/{}", 
                        user.getId(), fullName, phoneNumber, map.get("fullName"), map.get("phoneNumber"));
                throw new BusinessException(ErrorCode.USER_NOT_FOUND);
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("[Auth] Decryption failed for user: {}", user.getId(), e);
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
        }

        // 임시 비밀번호 생성 후 저장하고 반환
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
