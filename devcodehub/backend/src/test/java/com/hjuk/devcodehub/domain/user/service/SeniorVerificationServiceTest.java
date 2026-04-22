package com.hjuk.devcodehub.domain.user.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.hjuk.devcodehub.domain.user.domain.SeniorVerification;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.domain.VerificationStatus;
import com.hjuk.devcodehub.domain.user.dto.SeniorVerificationRequest;
import com.hjuk.devcodehub.domain.user.repository.SeniorVerificationRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class SeniorVerificationServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private SeniorVerificationRepository seniorVerificationRepository;
  @Mock private ApplicationEventPublisher eventPublisher;

  @InjectMocks private SeniorVerificationService seniorVerificationService;

  @Test
  @DisplayName("시니어 인증 요청이 정상적으로 처리되어야 함")
  void requestSeniorVerification_Success() {
    String loginId = "user1";
    User user = User.builder().loginId(loginId).nickname("tester").build();
    ReflectionTestUtils.setField(user, "id", 1L);
    SeniorVerificationRequest request = new SeniorVerificationRequest();
    request.setCareerSummary("10년차 백엔드 개발자");

    when(userRepository.findByLoginId(loginId)).thenReturn(Optional.of(user));
    when(seniorVerificationRepository.findByUserIdAndStatus(1L, VerificationStatus.PENDING))
        .thenReturn(Optional.empty());

    seniorVerificationService.requestSeniorVerification(loginId, request);

    verify(seniorVerificationRepository, times(1)).save(any(SeniorVerification.class));
    verify(eventPublisher, times(1))
        .publishEvent(
            any(com.hjuk.devcodehub.domain.notification.event.SeniorVerificationEvent.class));
  }

  @Test
  @DisplayName("이미 진행 중인 인증 요청이 있는 경우 예외가 발생해야 함")
  void requestSeniorVerification_DuplicateRequest() {
    String loginId = "user1";
    User user = User.builder().loginId(loginId).nickname("tester").build();
    ReflectionTestUtils.setField(user, "id", 1L);
    SeniorVerificationRequest request = new SeniorVerificationRequest();

    when(userRepository.findByLoginId(loginId)).thenReturn(Optional.of(user));
    when(seniorVerificationRepository.findByUserIdAndStatus(1L, VerificationStatus.PENDING))
        .thenReturn(Optional.of(mock(SeniorVerification.class)));

    assertThrows(
        BusinessException.class,
        () -> seniorVerificationService.requestSeniorVerification(loginId, request));
  }
}
