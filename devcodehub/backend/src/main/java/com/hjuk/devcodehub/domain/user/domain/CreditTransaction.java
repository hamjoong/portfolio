package com.hjuk.devcodehub.domain.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** [Why] 사용자 크레딧 변동 이력을 관리하는 엔티티입니다. */
@Entity
@Table(
    name = "credit_transactions",
    indexes = {@Index(name = "idx_transaction_user_created", columnList = "user_id, createdAt")})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CreditTransaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private CreditTransactionType type;

  @Column(nullable = false)
  private int amount;

  @Column(nullable = false)
  private int balanceAfter;

  private Long targetId;

  private LocalDateTime createdAt;

  /**
   * [Why] 크레딧 거래 내역을 생성합니다.
   *
   * @param user         거래 사용자
   * @param type         거래 유형
   * @param amount       거래 금액
   * @param balanceAfter 거래 후 잔액
   * @param targetId     대상 ID
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public CreditTransaction(
      User user, CreditTransactionType type, int amount, int balanceAfter, Long targetId) {
    this.user = user;
    this.type = type;
    this.amount = amount;
    this.balanceAfter = balanceAfter;
    this.targetId = targetId;
    this.createdAt = LocalDateTime.now();
  }
}
