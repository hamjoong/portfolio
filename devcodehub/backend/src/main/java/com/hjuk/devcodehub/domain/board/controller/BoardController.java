package com.hjuk.devcodehub.domain.board.controller;

import com.hjuk.devcodehub.domain.board.domain.BoardType;
import com.hjuk.devcodehub.domain.board.dto.BoardRequest;
import com.hjuk.devcodehub.domain.board.dto.BoardResponse;
import com.hjuk.devcodehub.domain.board.service.BoardService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardController {

  private static final int DEFAULT_PAGE_SIZE = 10;
  private static final int UNAUTHORIZED_STATUS = 401;

  private final BoardService boardService;

  @PostMapping
  public ResponseEntity<ApiResponse<Long>> createBoard(
      @Valid @RequestBody BoardRequest request, @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(
        ApiResponse.success(boardService.createBoard(request, user.getUsername())));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Page<BoardResponse>>> getBoards(
      @RequestParam BoardType type,
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String tag,
      @PageableDefault(
              size = DEFAULT_PAGE_SIZE,
              sort = "createdAt",
              direction = Sort.Direction.DESC)
          Pageable pageable,
      @AuthenticationPrincipal User user) {
    String loginId = user != null ? user.getUsername() : null;
    return ResponseEntity.ok(
        ApiResponse.success(boardService.getBoards(type, keyword, tag, pageable, loginId)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<BoardResponse>> getBoard(
      @PathVariable Long id, @AuthenticationPrincipal User user) {
    String loginId = user != null ? user.getUsername() : null;
    return ResponseEntity.ok(ApiResponse.success(boardService.getBoardDetail(id, loginId)));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<String>> updateBoard(
      @PathVariable Long id,
      @Valid @RequestBody BoardRequest request,
      @AuthenticationPrincipal User user) {
    boardService.updateBoard(id, request, user.getUsername());
    return ResponseEntity.ok(ApiResponse.success("게시글이 수정되었습니다."));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<String>> deleteBoard(
      @PathVariable Long id, @AuthenticationPrincipal User user) {
    boardService.deleteBoard(id, user.getUsername());
    return ResponseEntity.ok(ApiResponse.success("게시글이 삭제되었습니다."));
  }

  @PostMapping("/{id}/like")
  public ResponseEntity<ApiResponse<Boolean>> toggleLike(
      @PathVariable Long id, @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(ApiResponse.success(boardService.toggleLike(id, user.getUsername())));
  }

  @PostMapping("/{id}/bookmark")
  public ResponseEntity<ApiResponse<Boolean>> toggleBookmark(
      @PathVariable Long id, @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(
        ApiResponse.success(boardService.toggleBookmark(id, user.getUsername())));
  }

  @PostMapping("/{id}/views")
  public ResponseEntity<ApiResponse<Void>> incrementViewCount(@PathVariable Long id) {
    boardService.incrementViewCount(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @GetMapping("/me/bookmarks")
  public ResponseEntity<ApiResponse<Page<BoardResponse>>> getMyBookmarks(
      @PageableDefault(
              size = DEFAULT_PAGE_SIZE,
              sort = "createdAt",
              direction = Sort.Direction.DESC)
          Pageable pageable,
      @AuthenticationPrincipal User user) {
    if (user == null) {
      return ResponseEntity.status(UNAUTHORIZED_STATUS).build();
    }
    return ResponseEntity.ok(
        ApiResponse.success(boardService.getMyBookmarks(user.getUsername(), pageable)));
  }
}
