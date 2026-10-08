package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.dto.UserResponse;
import com.hjuk.devcodehub.domain.user.dto.UserUpdateRequest;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final com.hjuk.devcodehub.domain.notification.service.NotificationService
      notificationService;
  private final SeniorVerificationService seniorVerificationService;
  private final FileStorageService fileStorageService;

  private static final String AVATARS_VERSION = "7.x";

  @org.springframework.beans.factory.annotation.Value("${app.upload.base-url}")
  private String uploadBaseUrl;

  @Value("${app.upload.base-url}")
  private String baseUrl;

  /**
   * [Why] 로그인 아이디를 기반으로 사용자의 전체 프로필 정보를 조회하여 DTO로 변환함.
   *
   * @param loginId 사용자 로그인 ID
   * @return 사용자 응답 DTO
   */
  @Transactional(readOnly = true)
  public UserResponse getMyInfo(String loginId) {
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    UserResponse response = new UserResponse(user, false);
    response.setRanking(userRepository.countRank(user.getLevel(), user.getExperience()));
    return response;
  }

  /**
   * [Why] 자신을 제외한 모든 회원 리스트를 조회함 (채팅 초대 등에서 활용).
   *
   * @param loginId 현재 사용자 로그인 ID
   * @return 타 사용자 응답 목록
   */
  @Transactional(readOnly = true)
  public List<UserResponse> getAllUsersExceptMe(String loginId) {
    // [Why] 전체를 읽어 자바에서 거르지 않고 DB에서 본인·비회원을 제외한다.
    return userRepository.findByLoginIdNotAndRoleNot(loginId, Role.GUEST).stream()
        .map(UserResponse::new)
        .collect(Collectors.toList());
  }

  public void updateMyInfo(String loginId, UserUpdateRequest request) {
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    if (user.getRole() == Role.GUEST) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    if (request.getNickname() != null && !request.getNickname().equals(user.getNickname())) {
      if (userRepository.existsByNickname(request.getNickname())) {
        throw new BusinessException("이미 사용 중인 닉네임입니다.", ErrorCode.INVALID_INPUT_VALUE);
      }
    }

    if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
      if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new BusinessException("이미 사용 중인 이메일입니다.", ErrorCode.EMAIL_DUPLICATE);
      }
    }

    user.updateProfile(
        request.getNickname(), request.getEmail(), request.getContact(), request.getAddress());

    if (request.getPassword() != null && !request.getPassword().isBlank()) {
      if (request.getCurrentPassword() == null
          || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
        throw new BusinessException("현재 비밀번호가 일치하지 않습니다.", ErrorCode.INVALID_INPUT_VALUE);
      }
      user.updatePassword(passwordEncoder.encode(request.getPassword()));
    }

    // [Why] 클라이언트가 임의 URL(트래킹 픽셀·javascript: 등)을 프로필 이미지로 저장하지 못하게 허용 출처만 받는다.
    if (request.getProfileImageUrl() != null) {
      requireAllowedImageUrl(request.getProfileImageUrl());
      user.updateProfileImage(request.getProfileImageUrl());
    } else if (request.getAvatarUrl() != null) {
      requireAllowedImageUrl(request.getAvatarUrl());
      user.updateAvatar(request.getAvatarUrl());
    }

    userRepository.save(user);
  }

  public String updateProfileImage(String loginId, MultipartFile file) {
    userRepository
        .findByLoginId(loginId)
        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    return fileStorageService.uploadProfileImage(file);
  }

  private void requireAllowedImageUrl(String url) {
    boolean allowed =
        url.startsWith(uploadBaseUrl.replaceAll("/$", "") + "/")
            || url.contains(".storage.supabase.co/storage/v1/object/public/")
            || url.startsWith("https://api.dicebear.com/");
    if (!allowed) {
      throw new BusinessException("허용되지 않은 이미지 주소입니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
  }

  public String updateAvatar(String loginId, String avatarSeed) {
    if (!avatarSeed.matches("^[a-zA-Z0-9_-]{1,50}$")) {
      throw new BusinessException("아바타 식별자 형식이 올바르지 않습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    if (user.getRole() == Role.GUEST) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    return String.format("https://api.dicebear.com/%s/avataaars/svg?seed=%s", AVATARS_VERSION, avatarSeed);
  }

  public void requestSeniorVerification(
      String loginId, com.hjuk.devcodehub.domain.user.dto.SeniorVerificationRequest request) {
    seniorVerificationService.requestSeniorVerification(loginId, request);
  }
}
