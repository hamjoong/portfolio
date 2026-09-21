package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.ProductOption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProductOptionRepository extends JpaRepository<ProductOption, UUID> {
}
