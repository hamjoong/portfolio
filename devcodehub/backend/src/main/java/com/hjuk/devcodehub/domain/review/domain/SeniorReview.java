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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "senior_reviews")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SeniorReview {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "request_id", nullable = false)
  private SeniorReviewRequest request;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "senior_id", nullable = false)
  private User senior;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  private int rating;
  private static final int MAX_RATING = 5;

  private LocalDateTime createdAt;

  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public SeniorReview(SeniorReviewRequest request, User senior, String content) {
    this.request = request;
    this.senior = senior;
    this.content = content;
    this.createdAt = LocalDateTime.now();
  }

  public void setRating(int rating) {
    if (rating < 1 || rating > MAX_RATING) {
      throw new IllegalArgumentException("Rating must be between 1 and " + MAX_RATING + ".");
    }
    this.rating = rating;
  }
}
