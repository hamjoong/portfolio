package com.projectx.auth.service;

import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.entity.ProductOption;
import com.projectx.auth.domain.entity.ProductStatus;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.dto.ProductCreateRequest;
import com.projectx.auth.dto.ProductResponse;
import com.projectx.auth.exception.BusinessException;
import com.projectx.auth.exception.ErrorCode;
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
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductSearchService productSearchService;

    @Cacheable(value = "products", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(Pageable pageable) {
        log.info("[Product] Fetching products from DB for page: {}", pageable.getPageNumber());
        try {
            Page<Product> products = productRepository.findByStatus(ProductStatus.FOR_SALE, pageable);
            log.info("[Product] Found {} products in DB", products.getTotalElements());
            return products.map(ProductResponse::from);
        } catch (Exception e) {
            log.error("[Product] Error fetching products from DB: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Cacheable(value = "products", 
               key = "'cat:' + #categoryId + ':' + #minPrice + '-' + #maxPrice + ':' + #pageable.pageNumber",
               unless = "#result.content.isEmpty()")
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        log.info("[Product] Fetching products by category: {}, price: {} ~ {}", categoryId, minPrice, maxPrice);
        try {
            Page<Product> products = productRepository.findByCategory_IdAndPriceBetweenAndStatus(
                    categoryId, 
                    minPrice != null ? minPrice : BigDecimal.ZERO, 
                    maxPrice != null ? maxPrice : new BigDecimal("99999999"), 
                    ProductStatus.FOR_SALE, 
                    pageable);
            log.info("[Product] Found {} products for category {}", products.getTotalElements(), categoryId);
            return products.map(ProductResponse::from);
        } catch (Exception e) {
            log.error("[Product] Error fetching products by category: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        log.info("[Product] Searching products with keyword: {}", keyword);
        productSearchService.incrementSearchCount(keyword);
        
        try {
            List<ProductResponse> searchResults = productSearchService.searchWithRediSearch(keyword);
            if (!searchResults.isEmpty()) {
                log.info("[Product] Found {} results using RediSearch for: {}", searchResults.size(), keyword);
                return searchResults;
            }
        } catch (Exception e) {
            log.warn("[Product] RediSearch failed, falling back to RDB: {}", e.getMessage());
        }
        
        log.info("[Product] Falling back to RDB search for: {}", keyword);
        return productRepository.findByNameContainingOrDescriptionContainingAndStatus(
                keyword, keyword, ProductStatus.FOR_SALE, pageable)
                .map(ProductResponse::from)
                .getContent();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID id) {
        return productRepository.findById(id)
                .map(ProductResponse::from)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public UUID createProduct(ProductCreateRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .mainImageUrl(request.getImageUrl())
                .build();

        // [옵션 추가] 옵션 요청이 있는 경우 ProductOption 엔티티로 변환하여 저장
        if (request.getOptions() != null) {
            List<ProductOption> options = request.getOptions().stream()
                    .map(optionRequest -> ProductOption.builder()
                            .product(product)
                            .optionType(optionRequest.getOptionType())
                            .optionName(optionRequest.getOptionName())
                            .additionalPrice(optionRequest.getAdditionalPrice())
                            .stockQuantity(optionRequest.getStockQuantity())
                            .build())
                    .collect(Collectors.toList());
            product.setOptions(options);
        }

        Product savedProduct = productRepository.save(product);
        productSearchService.indexProduct(ProductResponse.from(savedProduct));
        return savedProduct.getId();
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public UUID updateProduct(UUID id, ProductCreateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        
        product.update(request.getName(), request.getDescription(), request.getPrice(), request.getStockQuantity(), request.getImageUrl());
        
        // [옵션 업데이트] 기존 옵션 삭제 후 새로 생성
        if (request.getOptions() != null) {
            product.getOptions().clear();
            product.getOptions().addAll(request.getOptions().stream()
                    .map(optionRequest -> ProductOption.builder()
                            .product(product)
                            .optionType(optionRequest.getOptionType())
                            .optionName(optionRequest.getOptionName())
                            .additionalPrice(optionRequest.getAdditionalPrice())
                            .stockQuantity(optionRequest.getStockQuantity())
                            .build())
                    .collect(Collectors.toList()));
        }
        
        productRepository.save(product);
        return product.getId();
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        productRepository.delete(product);
        productSearchService.deleteIndex(id);
    }

    @Cacheable(value = "products", key = "'trending'")
    @Transactional(readOnly = true)
    public List<ProductResponse> getTrendingProducts() {
        log.info("[Product] Fetching trending products (HOT)");
        try {
            List<Product> products = productRepository.findTop10ByOrderBySalesCountDesc();
            log.info("[Product] Found {} trending products", products.size());
            return products.stream()
                    .map(ProductResponse::from)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("[Product] Error fetching trending products: {}", e.getMessage(), e);
            throw e;
        }
    }
}
