package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.notification.event.SeniorVerificationEvent;
import com.hjuk.devcodehub.domain.user.domain.SeniorVerification;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.domain.VerificationStatus;
import com.hjuk.devcodehub.domain.user.dto.SeniorVerificationRequest;
import com.hjuk.devcodehub.domain.user.repository.SeniorVerificationRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class SeniorVerificationService {

  private final UserRepository userRepository;
  private final SeniorVerificationRepository seniorVerificationRepository;
  private final ApplicationEventPublisher eventPublisher;

  public void requestSeniorVerification(String loginId, SeniorVerificationRequest request) {
    try {
      User user =
          userRepository
              .findByLoginId(loginId)
              .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

      if (user.getRole() == com.hjuk.devcodehub.domain.user.domain.Role.SENIOR
          || user.getRole() == com.hjuk.devcodehub.domain.user.domain.Role.ADMIN) {
        throw new BusinessException("이미 시니어 권한을 보유하고 있습니다.", ErrorCode.INVALID_INPUT_VALUE);
      }

      seniorVerificationRepository
          .findByUserIdAndStatus(user.getId(), VerificationStatus.PENDING)
          .ifPresent(
              v -> {
                throw new BusinessException("이미 진행 중인 인증 요청이 있습니다.", ErrorCode.INVALID_INPUT_VALUE);
              });

      SeniorVerification verification =
          SeniorVerification.builder()
              .user(user)
              .githubUrl(request.getGithubUrl())
              .linkedInUrl(request.getLinkedInUrl())
              .blogUrl(request.getBlogUrl())
              .careerSummary(request.getCareerSummary())
              .build();

      seniorVerificationRepository.save(verification);

      eventPublisher.publishEvent(
          new SeniorVerificationEvent(
              SeniorVerificationEvent.Type.REQUESTED, user.getLoginId(), user.getNickname(), null));
    } catch (Exception e) {
      log.error("Senior verification request failed for user {}: {}",
                com.hjuk.devcodehub.global.util.MaskingUtil.maskLoginId(loginId), e.getMessage(), e);
      throw e;
    }
  }
}
