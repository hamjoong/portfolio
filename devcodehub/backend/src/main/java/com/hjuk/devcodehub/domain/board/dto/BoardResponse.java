package com.hjuk.devcodehub.domain.board.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hjuk.devcodehub.domain.board.domain.Board;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardResponse {
  private Long id;
  private String title;
  private String content;
  private String authorNickname;
  private String authorLoginId;
  private List<String> tags;
  private int viewCount;
  private int likeCount;

  @JsonProperty("isLiked")
  private boolean isLiked;

  @JsonProperty("isBookmarked")
  private boolean isBookmarked;

  private String type;

  private LocalDateTime createdAt;

  private String newlyAcquiredBadge;

  public static BoardResponse from(
      Board board,
      int likeCount,
      boolean isLiked,
      boolean isBookmarked,
      String newlyAcquiredBadge) {
    return new BoardResponse(board, likeCount, isLiked, isBookmarked, newlyAcquiredBadge);
  }

  /**
   * [Why] 게시글 응답 DTO를 생성합니다.
   *
   * @param board                  게시글 엔티티
   * @param inputLikeCount         좋아요 수
   * @param inputIsLiked           좋아요 여부
   * @param inputIsBookmarked      북마크 여부
   * @param inputNewlyAcquiredBadge 새로 획득한 배지 명칭
   */
  public BoardResponse(
      Board board,
      int inputLikeCount,
      boolean inputIsLiked,
      boolean inputIsBookmarked,
      String inputNewlyAcquiredBadge) {
    this.id = board.getId();
    this.title = board.getTitle();
    this.content = board.getContent();

    if (board.getAuthor() != null) {
      this.authorNickname = board.getAuthor().getNickname();
      this.authorLoginId = board.getAuthor().getLoginId();
    } else {
      this.authorNickname = "Unknown Author";
      this.authorLoginId = "Unknown Author";
    }

    this.tags = board.getTags() != null ? new java.util.ArrayList<>(board.getTags()) : Collections.emptyList();
    this.viewCount = board.getViewCount();
    this.likeCount = inputLikeCount;
    this.isLiked = inputIsLiked;
    this.isBookmarked = inputIsBookmarked;
    this.type = board.getType() != null ? board.getType().name() : "SKILL";
    this.createdAt = board.getCreatedAt();
    this.newlyAcquiredBadge = inputNewlyAcquiredBadge;
  }
}
