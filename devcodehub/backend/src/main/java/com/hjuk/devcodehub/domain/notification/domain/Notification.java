package com.hjuk.devcodehub.domain.notification.domain;

import com.hjuk.devcodehub.domain.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** [Why] 사용자에게 알림을 보내기 위한 엔티티입니다. */
@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @Column(nullable = false)
  private String content;

  private boolean isRead;

  private LocalDateTime createdAt;

  /** [Why] 생성 시 초기값을 설정합니다. */
  @PrePersist
  public void prePersist() {
    this.createdAt = LocalDateTime.now();
    this.isRead = false;
  }
}
