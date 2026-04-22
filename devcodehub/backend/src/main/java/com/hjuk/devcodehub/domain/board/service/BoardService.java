package com.hjuk.devcodehub.domain.board.service;

import com.hjuk.devcodehub.domain.board.domain.Board;
import com.hjuk.devcodehub.domain.board.domain.BoardBookmark;
import com.hjuk.devcodehub.domain.board.domain.BoardLike;
import com.hjuk.devcodehub.domain.board.domain.BoardType;
import com.hjuk.devcodehub.domain.board.dto.BoardRequest;
import com.hjuk.devcodehub.domain.board.dto.BoardResponse;
import com.hjuk.devcodehub.domain.board.repository.BoardBookmarkRepository;
import com.hjuk.devcodehub.domain.board.repository.BoardLikeRepository;
import com.hjuk.devcodehub.domain.board.repository.BoardRepository;
import com.hjuk.devcodehub.domain.board.repository.BoardSpecification;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.ActivityService;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** [Why] 게시판 관련 비즈니스 로직을 처리하는 서비스입니다. */
@Service
@Transactional
@RequiredArgsConstructor
public class BoardService {

  private static final int ACTIVITY_POINTS_FOR_POSTING = 20;

  private final BoardRepository boardRepository;
  private final BoardLikeRepository boardLikeRepository;
  private final BoardBookmarkRepository boardBookmarkRepository;
  private final UserRepository userRepository;
  private final BoardKeywordService boardKeywordService;
  private final ActivityService activityService;

  /**
   * [Why] 새 게시글을 작성하고 사용자 활동 점수를 기록합니다.
   *
   * @param request 게시글 작성 요청 데이터
   * @param loginId 작성자 로그인 ID
   * @return 생성된 게시글 ID
   */
  public Long createBoard(BoardRequest request, String loginId) {
    User author =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    Board board =
        Board.builder()
            .title(request.getTitle())
            .content(request.getContent())
            .type(request.getType() != null ? request.getType() : BoardType.SKILL)
            .author(author)
            .tags(
                request.getTags() != null ? new ArrayList<>(request.getTags()) : new ArrayList<>())
            .build();

    Long boardId = boardRepository.saveAndFlush(board).getId();
    activityService.recordActivity(loginId, ACTIVITY_POINTS_FOR_POSTING);
    return boardId;
  }

  public Page<BoardResponse> getBoards(
      BoardType type, String keyword, String tag, Pageable pageable, String loginId) {
    Optional<User> currentUser = getUserByLoginId(loginId);

    Specification<Board> spec =
        BoardSpecification.filterByTypeKeywordTag(type, keyword, tag, boardKeywordService);
    Page<Board> boards = boardRepository.findAll(spec, pageable);

    List<Long> boardIds =
        boards.getContent().stream().map(Board::getId).collect(Collectors.toList());

    if (boardIds.isEmpty()) {
      return boards.map(board -> BoardResponse.from(board, 0, false, false, null));
    }

    Map<Long, Integer> likeCounts = fetchLikeCounts(boardIds);
    Set<Long> likedBoardIds = new HashSet<>();
    Set<Long> bookmarkedBoardIds = new HashSet<>();

    currentUser.ifPresent(
        user -> {
          likedBoardIds.addAll(fetchUserLikedBoardIds(user, boardIds));
          bookmarkedBoardIds.addAll(fetchUserBookmarkedBoardIds(user, boardIds));
        });

    return boards.map(
        board ->
            BoardResponse.from(
                board,
                likeCounts.getOrDefault(board.getId(), 0),
                likedBoardIds.contains(board.getId()),
                bookmarkedBoardIds.contains(board.getId()),
                null));
  }

  private Map<Long, Integer> fetchLikeCounts(List<Long> boardIds) {
    return boardLikeRepository.countByBoardIdIn(boardIds).stream()
        .collect(
            Collectors.toMap(
                row -> (Long) row[0],
                row -> ((Long) row[1]).intValue(),
                (existing, replacement) -> existing));
  }

  private Set<Long> fetchUserLikedBoardIds(User user, List<Long> boardIds) {
    return new HashSet<>(
        boardLikeRepository.findBoardIdsByUserIdAndBoardIdIn(user.getId(), boardIds));
  }

  private Set<Long> fetchUserBookmarkedBoardIds(User user, List<Long> boardIds) {
    return new HashSet<>(
        boardBookmarkRepository.findBoardIdsByUserIdAndBoardIdIn(user.getId(), boardIds));
  }

  private Optional<User> getUserByLoginId(String loginId) {
    if (loginId == null || loginId.equals("guest")) {
      return Optional.empty();
    }
    return userRepository.findByLoginId(loginId);
  }

  public BoardResponse getBoardDetail(Long boardId, String loginId) {
    Board board =
        boardRepository
            .findById(boardId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
    Optional<User> currentUser = getUserByLoginId(loginId);
    Map<Long, Long> likeCounts =
        Map.of(board.getId(), (long) boardLikeRepository.countByBoardId(board.getId()));

    Set<Long> likedBoardIds = new HashSet<>();
    Set<Long> bookmarkedBoardIds = new HashSet<>();
    currentUser.ifPresent(
        user -> {
          if (boardLikeRepository.findByBoardIdAndUserId(board.getId(), user.getId()).isPresent()) {
            likedBoardIds.add(board.getId());
          }
          if (boardBookmarkRepository
              .findByBoardIdAndUserId(board.getId(), user.getId())
              .isPresent()) {
            bookmarkedBoardIds.add(board.getId());
          }
        });
    return BoardResponse.from(
        board,
        likeCounts.getOrDefault(board.getId(), 0L).intValue(),
        likedBoardIds.contains(board.getId()),
        bookmarkedBoardIds.contains(board.getId()),
        null);
  }

  public void incrementViewCount(Long boardId) {
    Board board =
        boardRepository
            .findById(boardId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
    board.incrementViewCount();
    boardRepository.saveAndFlush(board);
  }

  public void updateBoard(Long boardId, BoardRequest request, String loginId) {
    Board board =
        boardRepository
            .findById(boardId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
    validateAuthor(board, loginId);
    board.update(request.getTitle(), request.getContent(), request.getTags());
    boardRepository.saveAndFlush(board);
  }

  private void validateAuthor(Board board, String loginId) {
    if (!board.getAuthor().getLoginId().equals(loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }
  }

  public void deleteBoard(Long boardId, String loginId) {
    Board board =
        boardRepository
            .findById(boardId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
    validateAuthor(board, loginId);
    boardRepository.delete(board);
  }

  public boolean toggleLike(Long boardId, String loginId) {
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    Board board =
        boardRepository
            .findById(boardId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
    Optional<BoardLike> like = boardLikeRepository.findByBoardIdAndUserId(boardId, user.getId());
    if (like.isPresent()) {
      boardLikeRepository.delete(like.get());
      return false;
    } else {
      boardLikeRepository.save(new BoardLike(board, user));
      return true;
    }
  }

  public boolean toggleBookmark(Long boardId, String loginId) {
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    Board board =
        boardRepository
            .findById(boardId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));
    Optional<BoardBookmark> bookmark =
        boardBookmarkRepository.findByBoardIdAndUserId(boardId, user.getId());
    if (bookmark.isPresent()) {
      boardBookmarkRepository.delete(bookmark.get());
      return false;
    } else {
      boardBookmarkRepository.save(new BoardBookmark(board, user));
      return true;
    }
  }

  public Page<BoardResponse> getMyBookmarks(String loginId, Pageable pageable) {
    User currentUser =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    Page<BoardBookmark> bookmarks =
        boardBookmarkRepository.findByUserIdWithBoard(currentUser.getId(), pageable);
    List<Long> boardIds =
        bookmarks.getContent().stream().map(b -> b.getBoard().getId()).collect(Collectors.toList());
    Map<Long, Long> likeCounts =
        boardLikeRepository.countByBoardIdIn(boardIds).stream()
            .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1], (e, r) -> e));
    Set<Long> likedBoardIds =
        new HashSet<>(
            boardLikeRepository.findBoardIdsByUserIdAndBoardIdIn(currentUser.getId(), boardIds));
    Set<Long> bookmarkedBoardIds =
        new HashSet<>(
            boardBookmarkRepository.findBoardIdsByUserIdAndBoardIdIn(
                currentUser.getId(), boardIds));

    return bookmarks.map(
        b ->
            BoardResponse.from(
                b.getBoard(),
                likeCounts.getOrDefault(b.getBoard().getId(), 0L).intValue(),
                likedBoardIds.contains(b.getBoard().getId()),
                bookmarkedBoardIds.contains(b.getBoard().getId()),
                null));
  }
}
