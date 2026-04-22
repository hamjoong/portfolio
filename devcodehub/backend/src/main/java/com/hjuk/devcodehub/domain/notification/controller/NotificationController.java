package com.hjuk.devcodehub.domain.notification.controller;

import com.hjuk.devcodehub.domain.notification.service.NotificationService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
  private final NotificationService notificationService;

  @GetMapping
  public ResponseEntity<ApiResponse<?>> getMyNotifications(@AuthenticationPrincipal User user) {
    return ResponseEntity.ok(
        ApiResponse.success(notificationService.getMyNotifications(user.getUsername())));
  }
}
