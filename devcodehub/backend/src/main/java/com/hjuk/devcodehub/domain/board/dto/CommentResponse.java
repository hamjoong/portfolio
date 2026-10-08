package com.hjuk.devcodehub.domain.board.dto;

import com.hjuk.devcodehub.domain.board.domain.Comment;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
public class CommentResponse {
  private Long id;
  private String content;
  private String authorNickname;
  private String authorLoginId;
  private LocalDateTime createdAt;

  public CommentResponse(Comment comment) {
    this.id = comment.getId();
    this.content = comment.getContent();
    this.authorNickname = comment.getAuthor().getNickname();
    this.authorLoginId = comment.getAuthor().getLoginId();
    this.createdAt = comment.getCreatedAt();
  }
}
