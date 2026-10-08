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

  // [Why] 목록에서 요청마다 count 쿼리를 날리지 않도록 한 번에 묶어서 센다.
  @org.springframework.data.jpa.repository.Query(
      "SELECT a.request.id, COUNT(a) FROM SeniorReviewApplication a "
          + "WHERE a.request.id IN :requestIds GROUP BY a.request.id")
  List<Object[]> countByRequestIds(
      @org.springframework.data.repository.query.Param("requestIds") java.util.Collection<Long> requestIds);
}
