package com.hjuk.devcodehub.domain.review.repository;

import com.hjuk.devcodehub.domain.review.domain.SeniorReviewRequest;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface SeniorReviewRequestRepository extends JpaRepository<SeniorReviewRequest, Long> {

  @EntityGraph(attributePaths = {"junior", "tags"})
  Page<SeniorReviewRequest> findByStatus(SeniorReviewStatus status, Pageable pageable);

  @EntityGraph(attributePaths = {"junior", "senior", "tags"})
  @Override
  Optional<SeniorReviewRequest> findById(Long id);

  /**
   * [Why] 매칭·정산처럼 상태를 바꾸며 크레딧이 오가는 작업은 같은 요청을 동시에 두 번 처리하면 정산이
   * 중복된다. 행 잠금으로 직렬화한다. (@EntityGraph의 컬렉션 fetch join은 FOR UPDATE와 함께 쓸 수 없어 분리)
   */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select r from SeniorReviewRequest r where r.id = :id")
  Optional<SeniorReviewRequest> findByIdForUpdate(@Param("id") Long id);
}
