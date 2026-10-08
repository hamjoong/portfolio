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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** [Why] 시니어 등급 인증 요청 정보를 관리하는 도메인 엔티티입니다. */
@Entity
@Table(name = "senior_verifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SeniorVerification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  private String githubUrl;

  @Column(name = "linkedin_url")
  private String linkedInUrl;

  private String blogUrl;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String careerSummary;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private VerificationStatus status;

  private String rejectionReason;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  /**
   * [Why] 시니어 인증 요청을 생성합니다.
   *
   * @param user          신청 사용자
   * @param githubUrl     GitHub URL
   * @param linkedInUrl   LinkedIn URL
   * @param blogUrl       블로그 URL
   * @param careerSummary 경력 요약
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public SeniorVerification(
      User user, String githubUrl, String linkedInUrl, String blogUrl, String careerSummary) {
    this.user = user;
    this.githubUrl = githubUrl;
    this.linkedInUrl = linkedInUrl;
    this.blogUrl = blogUrl;
    this.careerSummary = careerSummary;
    this.status = VerificationStatus.PENDING;
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  /**
   * [Why] 인증 요청을 승인합니다.
   */
  public void approve() {
    this.status = VerificationStatus.APPROVED;
    this.updatedAt = LocalDateTime.now();
  }

  /**
   * [Why] 인증 요청을 거절합니다.
   *
   * @param inputReason 거절 사유
   */
  public void reject(String inputReason) {
    this.status = VerificationStatus.REJECTED;
    this.rejectionReason = inputReason;
    this.updatedAt = LocalDateTime.now();
  }
}
