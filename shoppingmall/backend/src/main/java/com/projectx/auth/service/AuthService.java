package com.projectx.auth.service;

import com.projectx.auth.config.JwtProvider;
import com.projectx.auth.domain.entity.User;
import com.projectx.auth.domain.entity.UserProfile;
import com.projectx.auth.domain.entity.UserStatus;
import com.projectx.auth.domain.repository.UserProfileRepository;
import com.projectx.auth.domain.repository.UserRepository;
import com.projectx.auth.dto.SignupRequest;
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

    @Value("${aws.kms.key-id}")
    private String kmsKeyId;

    /**
     * 회원 가입을 처리합니다. (계정 생성 + 암호화 프로필 생성)
     */
    @Transactional
    public UUID signup(SignupRequest request) {
        validateDuplicateEmail(request.getEmail());

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        User savedUser = userRepository.save(user);

        // 맵 기반 암호화 처리 (가독성 향상)
        String encryptedProfile = kmsService.encryptMap(Map.of(
                "fullName", request.getFullName(),
                "phoneNumber", request.getPhoneNumber(),
                "address", request.getAddress(),
                "detailAddress", request.getDetailAddress()
        ));

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
     * 로그인 성공 시 JWT 토큰을 발급합니다.
     */
    @Transactional(readOnly = true)
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("로그인이 제한된 계정입니다. (상태: " + user.getStatus().getDescription() + ")");
        }

        user.updateLastLogin(); // 마지막 로그인 시간 갱신 (리팩토링 포인트)
        return jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole());
    }

    private void validateDuplicateEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }
    }
}
