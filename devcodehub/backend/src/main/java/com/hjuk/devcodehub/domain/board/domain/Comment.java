package com.hjuk.devcodehub.domain.board.domain;

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
@Table(name = "comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @com.fasterxml.jackson.annotation.JsonIgnore
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "board_id", nullable = false)
  private Board board;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User author;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public Comment(Board board, User author, String content) {
    this.board = board;
    this.author = author;
    this.content = content;
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  /**
   * 댓글 내용을 수정합니다.
   *
   * @param inputContent 수정할 내용
   */
  public void update(String inputContent) {
    this.content = inputContent;
    this.updatedAt = LocalDateTime.now();
  }
}
