package com.hjuk.devcodehub.domain.review.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "guest_usage")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GuestUsage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String ipAddress;

  @Column(nullable = false)
  private int usageCount;

  private LocalDateTime lastUsedAt;

  /**
   * [Why] 비회원 사용량 정보를 생성합니다.
   *
   * @param ipAddress  IP 주소
   * @param usageCount 사용 횟수
   * @param lastUsedAt 마지막 사용 일시
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public GuestUsage(String ipAddress, int usageCount, LocalDateTime lastUsedAt) {
    this.ipAddress = ipAddress;
    this.usageCount = usageCount;
    this.lastUsedAt = lastUsedAt;
  }

  public void incrementUsage() {
    this.usageCount++;
    this.lastUsedAt = LocalDateTime.now();
  }

  public void resetUsage() {
    this.usageCount = 0;
  }
}
