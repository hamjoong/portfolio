package com.hjuk.devcodehub.domain.user.repository;

import com.hjuk.devcodehub.domain.user.domain.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
  // 기본 CRUD만 사용한다
}
