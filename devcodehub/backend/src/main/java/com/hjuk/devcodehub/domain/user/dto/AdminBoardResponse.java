package com.hjuk.devcodehub.domain.user.dto;

import com.hjuk.devcodehub.domain.board.domain.Board;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
public class AdminBoardResponse {
  private Long id;
  private String title;
  private String type;
  private String authorNickname;
  private String authorLoginId;
  private int viewCount;
  private LocalDateTime createdAt;

  public AdminBoardResponse(Board board) {
    this.id = board.getId();
    this.title = board.getTitle();
    this.type = board.getType().name();
    this.authorNickname = board.getAuthor().getNickname();
    this.authorLoginId = board.getAuthor().getLoginId();
    this.viewCount = board.getViewCount();
    this.createdAt = board.getCreatedAt();
  }
}
