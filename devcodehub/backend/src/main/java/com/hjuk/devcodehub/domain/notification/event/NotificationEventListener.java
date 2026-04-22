package com.hjuk.devcodehub.domain.notification.event;

import com.hjuk.devcodehub.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

  private final NotificationService notificationService;

  @org.springframework.scheduling.annotation.Async
  @EventListener
  public void handleChatInvitation(ChatInvitationEvent event) {
    String message = String.format("%s님과의 채팅방에 초대되었습니다.", event.getInviterNickname());

    for (String targetId : event.getTargetLoginIds()) {
      notificationService.sendRealTimeNotification(targetId, message);
      notificationService.saveNotification(targetId, message);
      log.info("Chat invitation notification sent to: {}", targetId);
    }
  }

  @EventListener
  public void handleSeniorMatched(SeniorMatchedEvent event) {
    String message = String.format("[%s] 리뷰가 시니어님과 매칭되었습니다.", event.getRequestTitle());
    notificationService.sendRealTimeNotification(event.getJuniorLoginId(), message);
    notificationService.saveNotification(event.getJuniorLoginId(), message);
    log.info("Senior matched notification sent to junior: {}", event.getJuniorLoginId());
  }

  @EventListener
  public void handleSeniorVerification(SeniorVerificationEvent event) {
    String keyword = "시니어 인증 신청";

    // 1. 주니어의 기존 알림 삭제 (상태 변화 시)
    notificationService.deleteNotificationsByContent(event.getJuniorLoginId(), keyword);
    notificationService.sendDeleteNotification(event.getJuniorLoginId(), keyword);

    if (event.getType() == SeniorVerificationEvent.Type.REQUESTED) {
      String juniorMsg = "시니어 인증 신청이 접수되었습니다.";
      notificationService.sendRealTimeNotification(event.getJuniorLoginId(), juniorMsg);
      notificationService.saveNotification(event.getJuniorLoginId(), juniorMsg);

      String adminMsg =
          String.format("[%s] %s님의 시니어 인증 신청이 있습니다.", keyword, event.getJuniorNickname());
      notificationService.sendRealTimeNotification("admin", adminMsg);
      notificationService.saveNotificationToAllAdmins(adminMsg);
    } else if (event.getType() == SeniorVerificationEvent.Type.APPROVED) {
      String msg = "축하합니다! 시니어 개발자로 인증되었습니다.";
      notificationService.sendRealTimeNotification(event.getJuniorLoginId(), msg);
      notificationService.saveNotification(event.getJuniorLoginId(), msg);

      // 관리자 채널에서 해당 주니어의 신청 알림 전역 삭제
      String adminTargetKeyword = event.getJuniorNickname() + "님의 시니어 인증 신청";
      notificationService.deleteNotificationsGlobally(adminTargetKeyword);
      notificationService.sendDeleteNotificationToChannel("admin", adminTargetKeyword);
    } else if (event.getType() == SeniorVerificationEvent.Type.REJECTED) {
      String msg = String.format("시니어 인증 신청이 반려되었습니다. 사유: %s", event.getReason());
      notificationService.sendRealTimeNotification(event.getJuniorLoginId(), msg);
      notificationService.saveNotification(event.getJuniorLoginId(), msg);

      // 관리자 채널에서 해당 주니어의 신청 알림 전역 삭제
      String adminTargetKeyword = event.getJuniorNickname() + "님의 시니어 인증 신청";
      notificationService.deleteNotificationsGlobally(adminTargetKeyword);
      notificationService.sendDeleteNotificationToChannel("admin", adminTargetKeyword);
    }
  }

  @EventListener
  public void handleSeniorReviewRequested(SeniorReviewRequestedEvent event) {
    String message =
        String.format("[%s] %s님의 시니어 리뷰 요청", event.getRequestTitle(), event.getJuniorNickname());

    // 모든 시니어/관리자 DB에 저장
    notificationService.saveNotificationToAllSeniors(message);

    // 실시간 브로드캐스트 (Senior 채널)
    notificationService.sendRealTimeNotificationToChannel("senior", message);
    log.info(
        "Senior review request notification sent to all seniors for: {}", event.getRequestTitle());
  }

  @EventListener
  public void handleReviewCompleted(ReviewCompletedEvent event) {
    // 1. 주니어의 기존 '매칭' 알림 등 삭제
    notificationService.deleteNotificationsByContent(event.getJuniorLoginId(), event.getTitle());
    notificationService.sendDeleteNotification(event.getJuniorLoginId(), event.getTitle());

    // 2. 모든 시니어의 알림 센터에서 해당 리뷰 요청 알림 삭제 (누군가 완료했으므로)
    String seniorKeyword =
        event.getTitle()
            + "님의 시니어 리뷰 요청"; // SeniorReviewRequestedEvent와 포맷을 맞춰야함. 아차, 위에서 포맷이 달랐네요.
    // 다시 확인: handleSeniorReviewRequested에서 "[제목] 닉네임님의 시니어 리뷰 요청"
    String globalKeyword = String.format("[%s]", event.getTitle());
    notificationService.deleteNotificationsGlobally(globalKeyword);
    notificationService.sendDeleteNotificationToChannel("senior", globalKeyword);

    String message = String.format("[%s] 요청하신 리뷰가 완료되었습니다.", event.getTitle());
    notificationService.sendRealTimeNotification(event.getJuniorLoginId(), message);
    notificationService.saveNotification(event.getJuniorLoginId(), message);
    log.info("Review completed notification sent to junior: {}", event.getJuniorLoginId());
  }
}
