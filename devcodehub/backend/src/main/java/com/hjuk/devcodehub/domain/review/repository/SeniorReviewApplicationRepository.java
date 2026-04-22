package com.hjuk.devcodehub.domain.review.repository;

import com.hjuk.devcodehub.domain.review.domain.SeniorReviewApplication;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewRequest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeniorReviewApplicationRepository
    extends JpaRepository<SeniorReviewApplication, Long> {

  @EntityGraph(attributePaths = {"senior"})
  List<SeniorReviewApplication> findByRequest(SeniorReviewRequest request);

  Optional<SeniorReviewApplication> findByRequestIdAndSeniorId(Long requestId, Long seniorId);

  long countByRequest(SeniorReviewRequest request);
}
