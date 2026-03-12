package com.projectx.auth.service;

import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.entity.ProductStatus;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 상품 관리 서비스입니다.
 * [성능 최적화] 복합 검색 조건에 대한 Redis 캐싱 전략을 강화하고, 
 * RediSearch 연동을 통한 초고속 조회를 우선 수행합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductSearchService productSearchService;

    /**
     * 전체 상품 목록 조회 (캐싱 적용)
     * [이유] 페이징 정보를 포함한 캐시 키를 생성하여 동일 페이지 요청 시 DB 접근을 차단합니다.
     */
    @Cacheable(value = "products", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(Pageable pageable) {
        log.info("[Performance] Fetching products from DB (Cache Miss)");
        return productRepository.findByStatus(ProductStatus.FOR_SALE, pageable)
                .map(ProductResponse::from);
    }

    /**
     * 카테고리 및 가격 필터링 조회 (캐싱 고도화)
     * [이유] 카테고리별 베스트 상품 등 자주 조회되는 필터 조합을 캐싱하여 200ms 응답을 보장합니다.
     */
    @Cacheable(value = "products", 
               key = "'cat:' + #categoryId + ':' + #minPrice + '-' + #maxPrice + ':' + #pageable.pageNumber",
               unless = "#result.content.isEmpty()")
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByCategory_IdAndPriceBetweenAndStatus(
                categoryId, 
                minPrice != null ? minPrice : BigDecimal.ZERO, 
                maxPrice != null ? maxPrice : new BigDecimal("99999999"), 
                ProductStatus.FOR_SALE, 
                pageable)
                .map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        productSearchService.incrementSearchCount(keyword);
        
        // 1. RediSearch 우선 (In-memory Search)
        List<ProductResponse> searchResults = productSearchService.searchWithRediSearch(keyword);
        if (!searchResults.isEmpty()) return searchResults;
        
        // 2. RDB Fallback
        return productRepository.findByNameContainingOrDescriptionContainingAndStatus(
                keyword, keyword, ProductStatus.FOR_SALE, pageable)
                .map(ProductResponse::from)
                .getContent();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID id) {
        return productRepository.findById(id)
                .map(ProductResponse::from)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public UUID createProduct(com.projectx.auth.dto.ProductCreateRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .mainImageUrl(request.getImageUrl())
                .build();

        Product savedProduct = productRepository.save(product);
        productSearchService.indexProduct(ProductResponse.from(savedProduct));
        return savedProduct.getId();
    }
}
