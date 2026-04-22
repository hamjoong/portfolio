package com.hjuk.devcodehub.domain.notification.service;

import com.hjuk.devcodehub.domain.notification.domain.Notification;
import com.hjuk.devcodehub.domain.notification.repository.NotificationRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {
  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;
  private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

  private static final int NOTIFICATION_EXPIRY_HOURS = 24;

  public void saveNotification(String loginId, String content) {
    if (loginId == null) {
      notificationRepository.save(Notification.builder().content(content).build());
      return;
    }
    userRepository
        .findByLoginId(loginId)
        .ifPresent(
            user -> {
              notificationRepository.save(
                  Notification.builder().user(user).content(content).build());
            });
  }

  public void saveNotificationToAllSeniors(String content) {
    List<com.hjuk.devcodehub.domain.user.domain.User> seniors =
        userRepository.findAll().stream()
            .filter(
                u ->
                    u.getRole() == com.hjuk.devcodehub.domain.user.domain.Role.SENIOR
                        || u.getRole() == com.hjuk.devcodehub.domain.user.domain.Role.ADMIN)
            .toList();

    for (com.hjuk.devcodehub.domain.user.domain.User senior : seniors) {
      notificationRepository.save(Notification.builder().user(senior).content(content).build());
    }
  }

  public void saveNotificationToAllAdmins(String content) {
    List<com.hjuk.devcodehub.domain.user.domain.User> admins =
        userRepository.findAll().stream()
            .filter(u -> u.getRole() == com.hjuk.devcodehub.domain.user.domain.Role.ADMIN)
            .toList();

    for (com.hjuk.devcodehub.domain.user.domain.User admin : admins) {
      notificationRepository.save(Notification.builder().user(admin).content(content).build());
    }
  }

  public void deleteNotificationsByContent(String loginId, String contentKeyword) {
    List<Notification> notifications =
        notificationRepository.findByUserLoginIdOrderByCreatedAtDesc(loginId);
    for (Notification n : notifications) {
      if (n.getContent().contains(contentKeyword)) {
        notificationRepository.delete(n);
      }
    }
  }

  public void deleteNotificationsGlobally(String contentKeyword) {
    List<Notification> allNotifications = notificationRepository.findAll();
    for (Notification n : allNotifications) {
      if (n.getContent().contains(contentKeyword)) {
        notificationRepository.delete(n);
      }
    }
  }

  public void sendRealTimeNotification(String loginId, String message) {
    Map<String, String> payload = Map.of("text", message, "type", "MESSAGE");
    messagingTemplate.convertAndSend("/sub/notifications/" + loginId, payload);
  }

  public void sendRealTimeNotificationToChannel(String channel, String message) {
    Map<String, String> payload = Map.of("text", message, "type", "MESSAGE");
    messagingTemplate.convertAndSend("/sub/notifications/" + channel, payload);
  }

  public void sendDeleteNotification(String loginId, String keyword) {
    Map<String, String> payload = Map.of("type", "DELETE", "keyword", keyword);
    messagingTemplate.convertAndSend("/sub/notifications/" + loginId, payload);
  }

  public void sendDeleteNotificationToChannel(String channel, String keyword) {
    Map<String, String> payload = Map.of("type", "DELETE", "keyword", keyword);
    messagingTemplate.convertAndSend("/sub/notifications/" + channel, payload);
  }

  @Transactional(readOnly = true)
  public List<com.hjuk.devcodehub.domain.notification.dto.NotificationResponse> getMyNotifications(
      String loginId) {
    java.time.LocalDateTime expiryTime = java.time.LocalDateTime.now().minusHours(NOTIFICATION_EXPIRY_HOURS);
    return notificationRepository.findByUserLoginIdOrderByCreatedAtDesc(loginId).stream()
        .filter(n -> n.getCreatedAt().isAfter(expiryTime))
        .map(com.hjuk.devcodehub.domain.notification.dto.NotificationResponse::new)
        .collect(java.util.stream.Collectors.toList());
  }
}
