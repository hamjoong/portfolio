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
import java.util.Map;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** [Why] AI 리뷰 결과를 저장하고 관리하는 도메인 엔티티입니다. */
@Entity
@Table(name = "reviews")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String codeContent;

  @Column(columnDefinition = "TEXT")
  private String aiResult;

  @Column(nullable = false)
  private String language;

  @Column(nullable = false)
  private String modelName;

  @JdbcTypeCode(SqlTypes.JSON)
  private Map<String, Object> structuredResult;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User author;

  private LocalDateTime createdAt;

  /**
   * [Why] 리뷰 정보를 생성합니다.
   *
   * @param title            리뷰 제목
   * @param codeContent      분석할 코드 내용
   * @param aiResult         AI 분석 원문 결과
   * @param language         사용된 프로그래밍 언어
   * @param modelName        사용된 AI 모델명
   * @param structuredResult 구조화된 분석 결과
   * @param author           작성자 정보
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public Review(
      String title,
      String codeContent,
      String aiResult,
      String language,
      String modelName,
      Map<String, Object> structuredResult,
      User author) {
    this.title = title;
    this.codeContent = codeContent;
    this.aiResult = aiResult;
    this.language = language;
    this.modelName = modelName;
    this.structuredResult = structuredResult;
    this.author = author;
    this.createdAt = LocalDateTime.now();
  }
}
