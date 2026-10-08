package com.hjuk.devcodehub.domain.review.repository;

import com.hjuk.devcodehub.domain.review.domain.SeniorReview;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeniorReviewRepository extends JpaRepository<SeniorReview, Long> {
  Optional<SeniorReview> findByRequestId(Long requestId);
}
