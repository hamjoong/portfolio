package com.hjuk.devcodehub.domain.review.repository;

import com.hjuk.devcodehub.domain.review.domain.Review;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {
  @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author"})
  @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
  Page<Review> findLatestReviews(Pageable pageable);

  @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author"})
  Page<Review> findByAuthorLoginIdOrderByCreatedAtDesc(String loginId, Pageable pageable);

  @Query(
      "SELECT CAST(r.createdAt AS date) as date, COUNT(r) as count "
          + "FROM Review r WHERE r.createdAt >= :startDate "
          + "GROUP BY CAST(r.createdAt AS date) "
          + "ORDER BY CAST(r.createdAt AS date) ASC")
  List<Object[]> countDailyReviews(
      @org.springframework.data.repository.query.Param("startDate")
          java.time.LocalDateTime startDate);

  @Query("SELECT r.modelName, COUNT(r) FROM Review r GROUP BY r.modelName")
  List<Object[]> countReviewsByModel();
}
