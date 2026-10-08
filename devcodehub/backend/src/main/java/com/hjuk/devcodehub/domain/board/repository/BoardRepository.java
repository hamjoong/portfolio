package com.hjuk.devcodehub.domain.board.repository;

import com.hjuk.devcodehub.domain.board.domain.Board;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BoardRepository
    extends JpaRepository<Board, Long>, JpaSpecificationExecutor<Board> {

  @EntityGraph(attributePaths = {"author", "tags"})
  @Override
  Optional<Board> findById(Long id);

  // [Why] 목록의 작성자(author)를 행마다 따로 조회(N+1)하지 않고 한 번에 가져온다.
  @EntityGraph(attributePaths = {"author"})
  @Override
  org.springframework.data.domain.Page<Board> findAll(
      org.springframework.data.jpa.domain.Specification<Board> spec,
      org.springframework.data.domain.Pageable pageable);

  @Query(
      "SELECT CAST(b.createdAt AS date) as date, COUNT(b) as count "
          + "FROM Board b WHERE b.createdAt >= :startDate "
          + "GROUP BY CAST(b.createdAt AS date) "
          + "ORDER BY CAST(b.createdAt AS date) ASC")
  List<Object[]> countDailyPosts(
      @org.springframework.data.repository.query.Param("startDate")
          java.time.LocalDateTime startDate);

  @EntityGraph(attributePaths = {"author"})
  @Query(value = "SELECT b FROM Board b", countQuery = "SELECT COUNT(b) FROM Board b")
  org.springframework.data.domain.Page<Board> findAllWithAuthor(
      org.springframework.data.domain.Pageable pageable);

  @EntityGraph(attributePaths = {"author"})
  @Query(
      value =
          "SELECT b FROM Board b JOIN b.author a WHERE "
              + "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
              + "LOWER(a.nickname) LIKE LOWER(CONCAT('%', :keyword, '%'))",
      countQuery =
          "SELECT COUNT(b) FROM Board b JOIN b.author a WHERE "
              + "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
              + "LOWER(a.nickname) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  org.springframework.data.domain.Page<Board> findAllByKeyword(
      @org.springframework.data.repository.query.Param("keyword") String keyword,
      org.springframework.data.domain.Pageable pageable);

  @Query("SELECT b.type, COUNT(b) FROM Board b GROUP BY b.type")
  List<Object[]> countBoardsByType();

  long countByAuthorLoginId(String loginId);

  @Modifying(clearAutomatically = true)
  @Query("UPDATE Board b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
  int incrementViewCount(@Param("id") Long id);
}
