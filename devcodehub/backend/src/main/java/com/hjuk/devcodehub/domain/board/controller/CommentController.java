package com.hjuk.devcodehub.domain.board.controller;

import com.hjuk.devcodehub.domain.board.dto.CommentResponse;
import com.hjuk.devcodehub.domain.board.service.CommentService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/boards/{boardId}/comments")
@RequiredArgsConstructor
public class CommentController {

  private final CommentService commentService;

  @PostMapping
  public ResponseEntity<ApiResponse<Long>> createComment(
      @PathVariable Long boardId, @RequestBody String content, @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(
        ApiResponse.success(commentService.createComment(boardId, content, user.getUsername())));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
      @PathVariable Long boardId) {
    return ResponseEntity.ok(ApiResponse.success(commentService.getComments(boardId)));
  }

  @PutMapping("/{commentId}")
  public ResponseEntity<ApiResponse<String>> updateComment(
      @PathVariable Long boardId,
      @PathVariable Long commentId,
      @RequestBody String content,
      @AuthenticationPrincipal User user) {
    commentService.updateComment(commentId, content, user.getUsername());
    return ResponseEntity.ok(ApiResponse.success("댓글이 수정되었습니다."));
  }

  @DeleteMapping("/{commentId}")
  public ResponseEntity<ApiResponse<String>> deleteComment(
      @PathVariable Long boardId,
      @PathVariable Long commentId,
      @AuthenticationPrincipal User user) {
    commentService.deleteComment(commentId, user.getUsername());
    return ResponseEntity.ok(ApiResponse.success("댓글이 삭제되었습니다."));
  }
}
