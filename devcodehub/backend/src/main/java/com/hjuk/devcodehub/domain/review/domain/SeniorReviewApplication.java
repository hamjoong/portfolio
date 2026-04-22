package com.hjuk.devcodehub.domain.review.domain;

import com.hjuk.devcodehub.domain.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

@Entity
@Table(name = "senior_review_applications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SeniorReviewApplication {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "request_id", nullable = false)
  private SeniorReviewRequest request;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "senior_id", nullable = false)
  private User senior;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String message;

  private LocalDateTime createdAt;

  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public SeniorReviewApplication(SeniorReviewRequest request, User senior, String message) {
    this.request = request;
    this.senior = senior;
    this.message = message;
    this.createdAt = LocalDateTime.now();
  }
}
