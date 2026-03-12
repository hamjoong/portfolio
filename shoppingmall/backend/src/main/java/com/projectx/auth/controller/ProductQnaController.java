package com.projectx.auth.controller;

import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.ProductQnaRequest;
import com.projectx.auth.dto.ProductQnaResponse;
import com.projectx.auth.service.ProductQnaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/qnas")
@RequiredArgsConstructor
public class ProductQnaController {

    private final ProductQnaService qnaService;

    @PostMapping
    public ResponseEntity<ApiResponse<UUID>> createQna(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody ProductQnaRequest request) {
        log.info("[QNA] Creating QNA for user: {}, product: {}", userId, request.getProductId());
        UUID qnaId = qnaService.createQna(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success("문의가 등록되었습니다.", qnaId));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<ProductQnaResponse>>> getMyQnas(@AuthenticationPrincipal String userId) {
        log.info("[QNA] Fetching QNAs for user: {}", userId);
        List<ProductQnaResponse> qnas = qnaService.getMyQnas(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(qnas));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductQnaResponse>>> getProductQnas(@PathVariable UUID productId) {
        log.info("[QNA] Fetching QNAs for product: {}", productId);
        List<ProductQnaResponse> qnas = qnaService.getProductQnas(productId);
        return ResponseEntity.ok(ApiResponse.success(qnas));
    }
}
