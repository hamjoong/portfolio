package com.hjuk.devcodehub.domain.board.service;

import com.hjuk.devcodehub.domain.board.domain.Board;
import com.hjuk.devcodehub.domain.board.domain.Comment;
import com.hjuk.devcodehub.domain.board.dto.CommentResponse;
import com.hjuk.devcodehub.domain.board.repository.BoardRepository;
import com.hjuk.devcodehub.domain.board.repository.CommentRepository;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.ActivityService;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {

  private final CommentRepository commentRepository;
  private final BoardRepository boardRepository;
  private final UserRepository userRepository;
  private final ActivityService activityService;

  private static final int XP_COMMENT_REWARD = 5;

  public Long createComment(Long boardId, String content, String loginId) {
    // 빈 댓글 작성을 방지하여 커뮤니케이션의 품질을 유지합니다.
    if (content == null || content.trim().isEmpty()) {
      throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
    }

    Board board =
        boardRepository
            .findById(boardId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
    User author =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    Comment comment = Comment.builder().board(board).author(author).content(content).build();
    Long commentId = commentRepository.save(comment).getId();

    // 댓글 작성 보상: +5 XP
    activityService.recordActivity(loginId, XP_COMMENT_REWARD);

    return commentId;
  }

  /**
   * [Why] 게시글의 댓글 목록을 생성일 순으로 조회합니다.
   *
   * @param boardId 게시글 ID
   * @return 댓글 응답 목록
   */
  @Transactional(readOnly = true)
  public List<CommentResponse> getComments(Long boardId) {
    return commentRepository.findByBoardIdOrderByCreatedAtAsc(boardId).stream()
        .map(CommentResponse::new)
        .collect(Collectors.toList());
  }

  /**
   * [Why] 댓글을 수정합니다. 작성자 본인 확인을 통해 권한을 제한합니다.
   *
   * @param commentId 댓글 ID
   * @param content   수정할 내용
   * @param loginId   로그인 ID
   */
  public void updateComment(Long commentId, String content, String loginId) {
    Comment comment =
        commentRepository
            .findById(commentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

    if (!comment.getAuthor().getLoginId().equals(loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    comment.update(content);
    commentRepository.save(comment);
  }

  /**
   * [Why] 댓글을 삭제합니다. 작성자 본인 확인을 통해 권한을 제한합니다.
   *
   * @param commentId 댓글 ID
   * @param loginId   로그인 ID
   */
  public void deleteComment(Long commentId, String loginId) {
    Comment comment =
        commentRepository
            .findById(commentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

    if (!comment.getAuthor().getLoginId().equals(loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    commentRepository.delete(comment);
  }
}
