package com.hjuk.devcodehub.domain.user.repository;

import com.hjuk.devcodehub.domain.user.domain.SeniorVerification;
import com.hjuk.devcodehub.domain.user.domain.VerificationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeniorVerificationRepository extends JpaRepository<SeniorVerification, Long> {
  @EntityGraph(attributePaths = {"user"})
  List<SeniorVerification> findByStatus(VerificationStatus status);

  Optional<SeniorVerification> findByUserIdAndStatus(Long userId, VerificationStatus status);

  @EntityGraph(attributePaths = {"user"})
  @Override
  Optional<SeniorVerification> findById(Long id);
}
