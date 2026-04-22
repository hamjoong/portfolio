package com.hjuk.devcodehub.domain.user.repository;

import com.hjuk.devcodehub.domain.user.domain.UserSubscription;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<UserSubscription, Long> {
  Optional<UserSubscription> findByUserLoginIdAndActiveTrue(String loginId);
}
