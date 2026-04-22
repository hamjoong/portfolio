package com.hjuk.devcodehub.domain.notification.repository;

import com.hjuk.devcodehub.domain.notification.domain.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findByUserLoginIdOrderByCreatedAtDesc(String loginId);

  void deleteByCreatedAtBefore(java.time.LocalDateTime expiryTime);
}
