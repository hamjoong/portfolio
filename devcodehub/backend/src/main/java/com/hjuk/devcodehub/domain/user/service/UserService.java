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
  private final com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository
      transactionRepository;
  private final com.hjuk.devcodehub.domain.notification.service.NotificationService
      notificationService;
  private final SeniorVerificationService seniorVerificationService;
  private final FileStorageService fileStorageService;

  private static final int ACTIVITY_LOG_DAYS = 7;
  private static final String AVATARS_VERSION = "7.x";

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
   * [Why] 최근 7일간의 활동 로그를 집계하여 반환함.
   *
   * @param loginId 사용자 로그인 ID
   * @return 날짜별 활동 로그 목록
   */
  @Transactional(readOnly = true)
  public List<java.util.Map<String, Object>> getActivityLogs(String loginId) {
    List<com.hjuk.devcodehub.domain.user.domain.CreditTransaction> txs =
        transactionRepository
            .findByUserLoginIdOrderByCreatedAtDesc(
                loginId, org.springframework.data.domain.Pageable.unpaged())
            .getContent();

    java.time.LocalDate today = java.time.LocalDate.now();
    return txs.stream()
        .filter(
            tx ->
                tx.getCreatedAt() != null
                    && tx.getCreatedAt().toLocalDate().isAfter(today.minusDays(ACTIVITY_LOG_DAYS)))
        .collect(java.util.stream.Collectors.groupingBy(tx -> tx.getCreatedAt().toLocalDate()))
        .entrySet()
        .stream()
        .map(
            entry ->
                java.util.Map.<String, Object>of(
                    "date", entry.getKey().toString(),
                    "exp",
                        entry.getValue().stream().mapToInt(tx -> Math.abs(tx.getAmount())).sum()))
        .sorted(java.util.Comparator.comparing(m -> m.get("date").toString()))
        .collect(java.util.stream.Collectors.toList());
  }

  /**
   * [Why] 자신을 제외한 모든 회원 리스트를 조회함 (채팅 초대 등에서 활용).
   *
   * @param loginId 현재 사용자 로그인 ID
   * @return 타 사용자 응답 목록
   */
  @Transactional(readOnly = true)
  public List<UserResponse> getAllUsersExceptMe(String loginId) {
    return userRepository.findAll().stream()
        .filter(user -> !user.getLoginId().equals(loginId))
        .filter(user -> user.getRole() != Role.GUEST) // 비회원 제외
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
      user.updatePassword(passwordEncoder.encode(request.getPassword()));
    }

    if (request.getProfileImageUrl() != null) {
      user.updateProfileImage(request.getProfileImageUrl());
    } else if (request.getAvatarUrl() != null) {
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

  public String updateAvatar(String loginId, String avatarSeed) {
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
