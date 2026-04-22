package com.hjuk.devcodehub.domain.board.repository;

import com.hjuk.devcodehub.domain.board.domain.BoardLike;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BoardLikeRepository extends JpaRepository<BoardLike, Long> {
  Optional<BoardLike> findByBoardIdAndUserId(Long boardId, Long userId);

  int countByBoardId(Long boardId);

  @Query(
      "SELECT bl.board.id, COUNT(bl) FROM BoardLike bl WHERE bl.board.id IN :boardIds GROUP BY bl.board.id")
  List<Object[]> countByBoardIdIn(@Param("boardIds") List<Long> boardIds);

  @Query(
      "SELECT bl.board.id FROM BoardLike bl WHERE bl.user.id = :userId AND bl.board.id IN :boardIds")
  List<Long> findBoardIdsByUserIdAndBoardIdIn(
      @Param("userId") Long userId, @Param("boardIds") List<Long> boardIds);
}
