package com.hjuk.devcodehub.domain.review.repository;

import com.hjuk.devcodehub.domain.review.domain.GuestUsage;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestUsageRepository extends JpaRepository<GuestUsage, Long> {
  Optional<GuestUsage> findByIpAddress(String ipAddress);
}
