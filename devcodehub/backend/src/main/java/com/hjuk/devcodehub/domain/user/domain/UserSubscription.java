package com.hjuk.devcodehub.domain.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** [Why] 사용자의 구독 상태(플랜, 시작일, 종료일, 활성화 여부)를 관리하기 위한 엔티티입니다. */
@Entity
@Table(name = "user_subscriptions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserSubscription {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private SubscriptionPlan plan;

  @Column(nullable = false)
  private LocalDateTime startedAt;

  @Column(nullable = false)
  private LocalDateTime expiredAt;

  private boolean active;

  /**
   * [Why] 새로운 구독 정보를 생성합니다. 기본적으로 구독은 활성화 상태로 시작합니다.
   *
   * @param user      사용자 정보
   * @param plan      구독 플랜
   * @param startedAt 시작 일시
   * @param expiredAt 만료 일시
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public UserSubscription(
      User user, SubscriptionPlan plan, LocalDateTime startedAt, LocalDateTime expiredAt) {
    this.user = user;
    this.plan = plan;
    this.startedAt = startedAt;
    this.expiredAt = expiredAt;
    this.active = true;
  }

  /** [Why] 구독을 비활성화 처리합니다. */
  public void deactivate() {
    this.active = false;
  }
}
