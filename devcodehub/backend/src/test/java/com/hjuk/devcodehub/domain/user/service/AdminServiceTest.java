package com.hjuk.devcodehub.domain.user.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.hjuk.devcodehub.domain.notification.service.NotificationService;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewRequest;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewStatus;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewRequestRepository;
import com.hjuk.devcodehub.domain.user.domain.AdminLog;
import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.AdminLogRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private AdminLogRepository adminLogRepository;
  @Mock private SeniorReviewRequestRepository seniorReviewRequestRepository;
  @Mock private CreditService creditService;
  @Mock private NotificationService notificationService;

  @InjectMocks private AdminService adminService;

  @Test
  @DisplayName("관리자가 리뷰를 취소하고 환불하면 상태가 CANCELED로 변경되어야 함")
  void cancelReviewAndRefund_Success() {
    // given
    Long requestId = 1L;
    String adminId = "admin";
    User admin = User.builder().loginId(adminId).role(Role.ADMIN).build();
    User junior = User.builder().loginId("junior").build();
    SeniorReviewRequest request = SeniorReviewRequest.builder().junior(junior).build();

    when(userRepository.findByLoginId(adminId)).thenReturn(Optional.of(admin));
    when(seniorReviewRequestRepository.findById(requestId)).thenReturn(Optional.of(request));

    // when
    adminService.cancelReviewAndRefund(requestId, "운영자 판단", adminId);

    // then
    assertEquals(SeniorReviewStatus.CANCELED, request.getStatus());
    verify(creditService).earnCredits(any(), anyInt(), any(), any());
    verify(adminLogRepository).save(any(AdminLog.class));
  }

  @Test
  @DisplayName("이미 완료된 리뷰는 취소 시 예외가 발생해야 함")
  void cancelReviewAndRefund_FailWhenCompleted() {
    // given
    Long requestId = 1L;
    String adminId = "admin";
    User admin = User.builder().loginId(adminId).role(Role.ADMIN).build();
    SeniorReviewRequest request = mock(SeniorReviewRequest.class);
    when(request.getStatus()).thenReturn(SeniorReviewStatus.COMPLETED);

    when(userRepository.findByLoginId(adminId)).thenReturn(Optional.of(admin));
    when(seniorReviewRequestRepository.findById(requestId)).thenReturn(Optional.of(request));

    // when & then
    assertThrows(
        BusinessException.class,
        () -> adminService.cancelReviewAndRefund(requestId, "사유", adminId));
  }
}
