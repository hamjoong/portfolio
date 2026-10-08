package com.hjuk.devcodehub.domain.board.repository;

import com.hjuk.devcodehub.domain.board.domain.BoardBookmark;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardBookmarkRepository extends JpaRepository<BoardBookmark, Long> {
  Optional<BoardBookmark> findByBoardIdAndUserId(Long boardId, Long userId);

  @org.springframework.data.jpa.repository.Query(
      "SELECT bb.board.id FROM BoardBookmark bb WHERE bb.user.id = :userId AND bb.board.id IN :boardIds")
  List<Long> findBoardIdsByUserIdAndBoardIdIn(
      @org.springframework.data.repository.query.Param("userId") Long userId,
      @org.springframework.data.repository.query.Param("boardIds") List<Long> boardIds);

  @org.springframework.data.jpa.repository.Query(
      value =
          "SELECT bb FROM BoardBookmark bb JOIN FETCH bb.board b JOIN FETCH b.author WHERE bb.user.id = :userId",
      countQuery = "SELECT COUNT(bb) FROM BoardBookmark bb WHERE bb.user.id = :userId")
  Page<BoardBookmark> findByUserIdWithBoard(
      @org.springframework.data.repository.query.Param("userId") Long userId, Pageable pageable);
}
