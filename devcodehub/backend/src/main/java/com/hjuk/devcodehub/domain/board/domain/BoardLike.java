package com.hjuk.devcodehub.domain.board.domain;

import com.hjuk.devcodehub.domain.user.domain.User;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "board_likes",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"board_id", "user_id"})})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoardLike {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @com.fasterxml.jackson.annotation.JsonIgnore
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "board_id")
  private Board board;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  private LocalDateTime createdAt;

  /**
   * [Why] 게시글 좋아요를 생성합니다.
   *
   * @param board 게시글 정보
   * @param user  사용자 정보
   */
  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public BoardLike(Board board, User user) {
    this.board = board;
    this.user = user;
    this.createdAt = LocalDateTime.now();
  }
}
