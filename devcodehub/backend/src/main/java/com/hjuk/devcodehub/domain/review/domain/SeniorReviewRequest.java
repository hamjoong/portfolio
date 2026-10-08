package com.hjuk.devcodehub.domain.review.domain;

import com.hjuk.devcodehub.domain.user.domain.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "senior_review_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SeniorReviewRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "junior_id", nullable = false)
  private User junior;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "senior_id")
  private User senior; // Matched senior

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String codeContent;

  @Column(nullable = false)
  private String language;

  @ElementCollection
  @CollectionTable(
      name = "senior_review_request_tags",
      joinColumns = @JoinColumn(name = "request_id"))
  @Column(name = "tag")
  private List<String> tags = new ArrayList<>();

  @Column(nullable = false)
  private int credits;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private SeniorReviewStatus status;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public SeniorReviewRequest(
      User junior,
      String title,
      String content,
      String codeContent,
      String language,
      List<String> tags,
      int credits) {
    this.junior = junior;
    this.title = title;
    this.content = content;
    this.codeContent = codeContent;
    this.language = language;
    this.tags = tags != null ? tags : new ArrayList<>();
    this.credits = credits;
    this.status = SeniorReviewStatus.PENDING;
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  public void matchWithSenior(User inputSenior) {
    this.senior = inputSenior;
    this.status = SeniorReviewStatus.MATCHED;
    this.updatedAt = LocalDateTime.now();
  }

  public void completeReview() {
    this.status = SeniorReviewStatus.COMPLETED;
    this.updatedAt = LocalDateTime.now();
  }

  public void cancel() {
    this.status = SeniorReviewStatus.CANCELED;
    this.updatedAt = LocalDateTime.now();
  }
}
