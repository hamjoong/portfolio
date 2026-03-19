package com.projectx.auth.controller;

import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.ProductQnaRequest;
import com.projectx.auth.dto.ProductQnaResponse;
import com.projectx.auth.service.ProductQnaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResponse<Page<ProductQnaResponse>>> getMyQnas(
            @AuthenticationPrincipal String userId,
            Pageable pageable) {
        log.info("[QNA] Fetching QNAs for user: {}", userId);
        Page<ProductQnaResponse> qnas = qnaService.getMyQnas(UUID.fromString(userId), pageable);
        return ResponseEntity.ok(ApiResponse.success(qnas));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<ProductQnaResponse>>> getProductQnas(
            @PathVariable UUID productId,
            Pageable pageable) {
        log.info("[QNA] Fetching QNAs for product: {}", productId);
        Page<ProductQnaResponse> qnas = qnaService.getProductQnas(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success(qnas));
    }

    /**
     * [관리자] 문의에 답변을 등록합니다.
     */
    @PostMapping("/{qnaId}/answer")
    public ResponseEntity<ApiResponse<Void>> answerQna(
            @PathVariable UUID qnaId,
            @RequestBody com.projectx.auth.dto.AdminReplyRequest request) {
        log.info("[Admin] Answering QNA: {}", qnaId);
        qnaService.answerQna(qnaId, request.getContent());
        return ResponseEntity.ok(ApiResponse.success("답변이 등록되었습니다.", null));
    }
}
