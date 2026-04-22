package com.hjuk.devcodehub.domain.board.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.hjuk.devcodehub.domain.board.domain.Board;
import com.hjuk.devcodehub.domain.board.domain.BoardType;
import com.hjuk.devcodehub.domain.board.dto.BoardResponse;
import com.hjuk.devcodehub.domain.board.repository.BoardBookmarkRepository;
import com.hjuk.devcodehub.domain.board.repository.BoardLikeRepository;
import com.hjuk.devcodehub.domain.board.repository.BoardRepository;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

  @Mock private BoardRepository boardRepository;
  @Mock private BoardLikeRepository boardLikeRepository;
  @Mock private BoardBookmarkRepository boardBookmarkRepository;
  @Mock private UserRepository userRepository;
  @Mock private BoardKeywordService boardKeywordService;

  @InjectMocks private BoardService boardService;

  @Test
  @DisplayName("게시글 목록 조회 시 N+1 방지를 위한 벌크 조회가 정상적으로 수행되어야 함")
  void getBoards_OptimizationTest() {
    // given
    BoardType type = BoardType.SKILL;
    PageRequest pageable = PageRequest.of(0, 10);
    String loginId = "testUser";

    User user = User.builder().loginId(loginId).nickname("tester").build();
    Board board =
        Board.builder().title("Test Board").content("Content").type(type).author(user).build();
    Page<Board> boardPage = new PageImpl<>(List.of(board));

    when(userRepository.findByLoginId(loginId)).thenReturn(Optional.of(user));
    when(boardRepository.findAll(any(Specification.class), any(PageRequest.class)))
        .thenReturn(boardPage);
    when(boardLikeRepository.countByBoardIdIn(anyList())).thenReturn(Collections.emptyList());
    when(boardLikeRepository.findBoardIdsByUserIdAndBoardIdIn(eq(user.getId()), anyList()))
        .thenReturn(Collections.emptyList());
    when(boardBookmarkRepository.findBoardIdsByUserIdAndBoardIdIn(eq(user.getId()), anyList()))
        .thenReturn(Collections.emptyList());

    // when
    Page<BoardResponse> result = boardService.getBoards(type, null, null, pageable, loginId);

    // then
    assertNotNull(result);
    assertEquals(1, result.getContent().size());
    verify(boardLikeRepository, times(1)).countByBoardIdIn(anyList());
    verify(boardLikeRepository, times(1)).findBoardIdsByUserIdAndBoardIdIn(any(), anyList());
    verify(boardBookmarkRepository, times(1)).findBoardIdsByUserIdAndBoardIdIn(any(), anyList());
  }
}
