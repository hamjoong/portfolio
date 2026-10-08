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
        userRepository.findByRoleIn(
            List.of(
                com.hjuk.devcodehub.domain.user.domain.Role.SENIOR,
                com.hjuk.devcodehub.domain.user.domain.Role.ADMIN));
    notificationRepository.saveAll(
        seniors.stream().map(u -> Notification.builder().user(u).content(content).build()).toList());
  }

  public void saveNotificationToAllAdmins(String content) {
    List<com.hjuk.devcodehub.domain.user.domain.User> admins =
        userRepository.findByRoleIn(List.of(com.hjuk.devcodehub.domain.user.domain.Role.ADMIN));
    notificationRepository.saveAll(
        admins.stream().map(u -> Notification.builder().user(u).content(content).build()).toList());
  }

  public void deleteNotificationsByContent(String loginId, String contentKeyword) {
    notificationRepository.deleteByUserAndContentContaining(loginId, contentKeyword);
  }

  public void deleteNotificationsGlobally(String contentKeyword) {
    notificationRepository.deleteByContentContaining(contentKeyword);
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
