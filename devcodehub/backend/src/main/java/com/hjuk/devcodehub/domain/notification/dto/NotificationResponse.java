package com.hjuk.devcodehub.domain.notification.dto;

import com.hjuk.devcodehub.domain.notification.domain.Notification;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
public class NotificationResponse {
  private Long id;
  private String content;
  private boolean isRead;
  private LocalDateTime createdAt;

  public NotificationResponse(Notification notification) {
    this.id = notification.getId();
    this.content = notification.getContent();
    this.isRead = notification.isRead();
    this.createdAt = notification.getCreatedAt();
  }
}
