package com.hjuk.devcodehub.domain.user.repository;

import com.hjuk.devcodehub.domain.user.domain.AdminLog;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AdminLogRepository
    extends JpaRepository<AdminLog, Long>, JpaSpecificationExecutor<AdminLog> {
  @EntityGraph(attributePaths = {"admin", "targetUser"})
  List<AdminLog> findAll(Sort sort);

  @EntityGraph(attributePaths = {"admin", "targetUser"})
  Page<AdminLog> findAll(Pageable pageable);
}
