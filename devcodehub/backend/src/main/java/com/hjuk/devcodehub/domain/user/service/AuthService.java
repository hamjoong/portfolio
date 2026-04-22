package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.dto.FindIdRequest;
import com.hjuk.devcodehub.domain.user.dto.FindPwRequest;
import com.hjuk.devcodehub.domain.user.dto.LoginRequest;
import com.hjuk.devcodehub.domain.user.dto.LoginResponse;
import com.hjuk.devcodehub.domain.user.dto.SignupRequest;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import com.hjuk.devcodehub.global.security.jwt.JwtProvider;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** [Why] 사용자 인증 및 가입, 계정 찾기 서비스를 담당합니다. */
@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

  private static final int MASKING_THRESHOLD = 3;
  private static final int TEMP_PASSWORD_LENGTH = 8;

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtProvider jwtProvider;

  /**
   * [Why] 로그인 정보를 검증하고 JWT를 발급합니다.
   *
   * @param inputRequest 로그인 요청 데이터
   * @return 로그인 응답 객체
   */
  public LoginResponse login(LoginRequest inputRequest) {
    User user =
        userRepository
            .findByLoginId(inputRequest.getLoginId())
            .orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_FAIL));

    if (!passwordEncoder.matches(inputRequest.getPassword(), user.getPassword())) {
      throw new BusinessException(ErrorCode.LOGIN_FAIL);
    }

    String token = jwtProvider.createToken(user.getLoginId(), user.getRole().getKey());

    return new LoginResponse(
        token,
        user.getId(),
        user.getLoginId(),
        user.getNickname(),
        user.getRole().name(),
        user.getCredits(),
        user.getTotalSpentCredits(),
        user.getWeeklyFreeReviewUsed(),
        user.getMaxWeeklyFreeLimit(),
        user.getProfileImageUrl(),
        user.getAvatarUrl());
  }

  /**
   * [Why] 로그인 ID 중복 여부를 확인합니다.
   *
   * @param inputLoginId 로그인 아이디
   * @return 중복 여부
   */
  public boolean isLoginIdDuplicate(String inputLoginId) {
    return userRepository.existsByLoginIdIgnoreCase(inputLoginId.trim());
  }

  /**
   * [Why] 이메일 중복 여부를 확인합니다.
   *
   * @param inputEmail 이메일
   * @return 중복 여부
   */
  public boolean isEmailDuplicate(String inputEmail) {
    return userRepository.existsByEmailIgnoreCase(inputEmail.trim());
  }

  /**
   * [Why] 닉네임 중복 여부를 확인합니다.
   *
   * @param inputNickname 닉네임
   * @return 중복 여부
   */
  public boolean isNicknameDuplicate(String inputNickname) {
    return userRepository.existsByNicknameIgnoreCase(inputNickname.trim());
  }

  /**
   * [Why] 신규 사용자를 가입시킵니다.
   *
   * @param inputRequest 가입 요청 데이터
   */
  public void signup(SignupRequest inputRequest) {
    String loginId = inputRequest.getLoginId().trim();
    String email = inputRequest.getEmail().trim();
    String nickname = inputRequest.getNickname().trim();

    if (userRepository.existsByLoginIdIgnoreCase(loginId)) {
      throw new BusinessException(ErrorCode.LOGIN_ID_DUPLICATE);
    }

    if (userRepository.existsByEmailIgnoreCase(email)) {
      throw new BusinessException(ErrorCode.EMAIL_DUPLICATE);
    }

    if (userRepository.existsByNicknameIgnoreCase(nickname)) {
      throw new BusinessException(ErrorCode.NICKNAME_DUPLICATE);
    }

    String encodedPassword = passwordEncoder.encode(inputRequest.getPassword());
    userRepository.save(inputRequest.toEntity(encodedPassword));
  }

  /**
   * [Why] 이메일과 연락처를 통해 로그인 ID를 찾습니다.
   *
   * @param inputRequest 찾기 요청 데이터
   * @return 마스킹된 로그인 아이디
   */
  @Transactional(readOnly = true)
  public String findId(FindIdRequest inputRequest) {
    User user =
        userRepository
            .findByEmailAndContact(inputRequest.getEmail(), inputRequest.getContact())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    String loginId = user.getLoginId();
    if (loginId.length() <= MASKING_THRESHOLD) {
      return "***";
    }
    return loginId.substring(0, MASKING_THRESHOLD)
        + "*".repeat(loginId.length() - MASKING_THRESHOLD);
  }

  /**
   * [Why] 임시 비밀번호를 발급합니다.
   *
   * @param inputRequest 비밀번호 찾기 요청 데이터
   * @return 발급된 임시 비밀번호
   */
  public String resetPassword(FindPwRequest inputRequest) {
    User user =
        userRepository
            .findByLoginIdAndEmailAndContact(
                inputRequest.getLoginId(), inputRequest.getEmail(), inputRequest.getContact())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    String tempPassword = UUID.randomUUID().toString().substring(0, TEMP_PASSWORD_LENGTH);
    user.updatePassword(passwordEncoder.encode(tempPassword));
    return tempPassword;
  }
}
