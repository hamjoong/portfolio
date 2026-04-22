package com.hjuk.devcodehub.domain.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** [Why] 관리자의 주요 활동 이력을 기록하기 위한 엔티티입니다. */
@Entity
@Table(name = "admin_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "admin_id")
  private User admin;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "target_user_id")
  private User targetUser;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AdminActionType actionType;

  @Column(columnDefinition = "TEXT")
  private String reason;

  private LocalDateTime createdAt;

  /**
   * [Why] 관리자 활동 로그를 생성합니다.
   *
   * @param admin      로그를 남기는 관리자
   * @param targetUser 대상 사용자
   * @param actionType 수행한 동작 유형
   * @param reason     수행 사유
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public AdminLog(User admin, User targetUser, AdminActionType actionType, String reason) {
    this.admin = admin;
    this.targetUser = targetUser;
    this.actionType = actionType;
    this.reason = reason;
    this.createdAt = LocalDateTime.now();
  }
}
