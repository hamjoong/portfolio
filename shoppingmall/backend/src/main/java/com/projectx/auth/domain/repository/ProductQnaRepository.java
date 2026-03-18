package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.ProductQna;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductQnaRepository extends JpaRepository<ProductQna, UUID> {
    Page<ProductQna> findByUserId(UUID userId, Pageable pageable);
    Page<ProductQna> findByProductId(UUID productId, Pageable pageable);
}
