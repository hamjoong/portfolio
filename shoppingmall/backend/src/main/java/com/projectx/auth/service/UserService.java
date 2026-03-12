package com.projectx.auth.service;

import com.projectx.auth.domain.entity.User;
import com.projectx.auth.domain.entity.UserProfile;
import com.projectx.auth.domain.repository.UserProfileRepository;
import com.projectx.auth.domain.repository.UserRepository;
import com.projectx.auth.dto.UpdateProfileRequest;
import com.projectx.auth.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * 사용자 정보 조회 및 관리 비즈니스 로직입니다.
 * [리팩토링] 복잡한 암호화 데이터 처리를 KmsService로 캡슐화하고, 
 * 비즈니스 레이어는 데이터 매핑과 흐름 제어에 집중합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final KmsService kmsService;

    @Value("${aws.kms.key-id}")
    private String kmsKeyId;

    /**
     * 특정 사용자의 프로필을 복호화하여 조회합니다.
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(UUID userId) {
        User user = findUserById(userId);
        UserProfile profile = findUserProfileById(userId);

        Map<String, Object> profileData = kmsService.decryptToMap(profile.getEncryptedData());

        return UserProfileResponse.builder()
                .email(user.getEmail())
                .fullName((String) profileData.get("fullName"))
                .phoneNumber((String) profileData.get("phoneNumber"))
                .address((String) profileData.get("address"))
                .detailAddress((String) profileData.get("detailAddress"))
                .build();
    }

    /**
     * 사용자 프로필 정보를 업데이트합니다.
     */
    @Transactional
    public void updateUserProfile(UUID userId, UpdateProfileRequest request) {
        UserProfile profile = findUserProfileById(userId);

        String encryptedData = kmsService.encryptMap(Map.of(
                "fullName", request.getFullName(),
                "phoneNumber", request.getPhoneNumber(),
                "address", request.getAddress() != null ? request.getAddress() : "",
                "detailAddress", request.getDetailAddress() != null ? request.getDetailAddress() : ""
        ));

        profile.updateProfile(encryptedData, kmsKeyId);
        log.info("[User] Updated profile for user: {}", userId);
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private UserProfile findUserProfileById(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("프로필 정보가 존재하지 않습니다."));
    }
}
