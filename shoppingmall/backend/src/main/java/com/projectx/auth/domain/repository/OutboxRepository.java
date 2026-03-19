package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.OutboxEvent;
import com.projectx.auth.domain.entity.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findTop10ByStatusOrderByCreatedAtAsc(OutboxStatus status);
}
