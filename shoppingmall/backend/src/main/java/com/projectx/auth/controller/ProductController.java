package com.projectx.auth.controller;

import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.ProductCreateRequest;
import com.projectx.auth.dto.ProductResponse;
import com.projectx.auth.service.ProductSearchService;
import com.projectx.auth.service.ProductService;
import com.projectx.auth.service.S3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * 상품 관련 정보를 제공하는 API 컨트롤러입니다.
 * [이유] 사용자의 상품 탐색과 관리자의 상품 등록 등 상품 도메인의 
 * 외부 HTTP 요청을 처리하고 데이터를 응답하기 위함입니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductSearchService productSearchService;
    private final S3Service s3Service;

    /**
     * 상품 업로드를 위한 S3 Presigned URL을 발급합니다.
     */
    @GetMapping("/upload-url")
    public ResponseEntity<ApiResponse<String>> getUploadUrl(@RequestParam String fileName) {
        log.info("[Product] Generating upload URL for file: {}", fileName);
        String url = s3Service.getPresignedUrl(fileName);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    /**
     * 신규 상품을 등록합니다.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UUID>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        log.info("[Product] Creating new product: {}", request.getName());
        UUID productId = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("상품이 등록되었습니다.", productId));
    }

    /**
     * 전체 상품 목록을 페이징 처리하여 조회합니다.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(Pageable pageable) {
        log.info("[Product] Fetching all products with pagination: {}", pageable);
        Page<ProductResponse> products = productService.getProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    /**
     * 상품명 또는 설명을 기반으로 상품을 검색합니다. (RediSearch 우선)
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> searchProducts(
            @RequestParam String keyword, Pageable pageable) {
        log.info("[Product] Searching products with keyword: {}, pagination: {}", keyword, pageable);
        List<ProductResponse> products = productService.searchProducts(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    /**
     * 실시간 인기 검색어 상위 10개를 조회합니다.
     * [이유] 현재 트렌드를 사용자에게 보여줌으로써 추가적인 탐색과 구매를 유도하기 위함입니다.
     */
    @GetMapping("/popular-keywords")
    public ResponseEntity<ApiResponse<List<String>>> getPopularKeywords() {
        List<String> keywords = productSearchService.getPopularKeywords(10);
        return ResponseEntity.ok(ApiResponse.success(keywords));
    }

    /**
     * 카테고리별 상품 목록을 조회합니다.
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            Pageable pageable) {
        log.info("[Product] Fetching products for category: {}, price: {} ~ {}, pagination: {}", 
                categoryId, minPrice, maxPrice, pageable);
        Page<ProductResponse> products = productService.getProductsByCategory(categoryId, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    /**
     * 상품의 상세 정보를 조회합니다.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable UUID id) {
        log.info("[Product] Fetching details for product: {}", id);
        ProductResponse response = productService.getProduct(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 인기 상품(HOT) 목록을 조회합니다.
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getTrendingProducts() {
        log.info("[Product] Fetching trending products for HOT section");
        List<ProductResponse> products = productService.getTrendingProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }
}
