package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 상품 데이터에 접근하는 Repository 인터페이스입니다.
 * [이유] 대규모 상품 데이터 중 사용자가 원하는 특정 조건의 상품을 
 * 효율적으로 추출하여 응답 속도를 확보하기 위함입니다.
 */
public interface ProductRepository extends JpaRepository<Product, UUID> {

    /**
     * 판매 상태인 상품 목록을 조회합니다.
     * [이유] @EntityGraph를 통해 Category 정보를 한 번의 쿼리로 가져와서(Fetch Join)
     * 목록 조회 시 발생하는 N+1 성능 이슈를 방지하기 위함입니다.
     */
    @EntityGraph(attributePaths = {"category"})
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    /**
     * 키워드 기반 상품 검색을 수행합니다.
     */
    @EntityGraph(attributePaths = {"category"})
    Page<Product> findByNameContainingOrDescriptionContainingAndStatus(
            String nameKeyword, String descKeyword, ProductStatus status, Pageable pageable);

    /**
     * 카테고리 ID를 기반으로 상품 목록을 필터링 조회합니다.
     */
    @EntityGraph(attributePaths = {"category"})
    Page<Product> findByCategory_IdAndStatus(Long categoryId, ProductStatus status, Pageable pageable);

    /**
     * 카테고리 및 가격 범위를 기반으로 상품 목록을 필터링 조회합니다.
     */
    @EntityGraph(attributePaths = {"category"})
    Page<Product> findByCategory_IdAndPriceBetweenAndStatus(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, ProductStatus status, Pageable pageable);
}
