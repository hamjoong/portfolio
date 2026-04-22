package com.hjuk.devcodehub.domain.user.repository;

import com.hjuk.devcodehub.domain.user.domain.Badge;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
  Optional<Badge> findByName(String name);
}
