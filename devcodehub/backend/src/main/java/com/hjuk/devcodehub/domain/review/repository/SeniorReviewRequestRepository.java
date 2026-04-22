package com.hjuk.devcodehub.domain.review.repository;

import com.hjuk.devcodehub.domain.review.domain.SeniorReviewRequest;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeniorReviewRequestRepository extends JpaRepository<SeniorReviewRequest, Long> {

  @EntityGraph(attributePaths = {"junior", "tags"})
  Page<SeniorReviewRequest> findByStatus(SeniorReviewStatus status, Pageable pageable);

  @EntityGraph(attributePaths = {"junior", "tags"})
  Page<SeniorReviewRequest> findByJuniorLoginId(String loginId, Pageable pageable);

  @EntityGraph(attributePaths = {"senior", "tags"})
  Page<SeniorReviewRequest> findBySeniorLoginId(String loginId, Pageable pageable);

  @EntityGraph(attributePaths = {"junior", "senior", "tags"})
  @Override
  Optional<SeniorReviewRequest> findById(Long id);
}
