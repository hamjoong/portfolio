package com.projectx.auth.controller;

import com.projectx.auth.domain.entity.Category;
import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.CategoryResponse;
import com.projectx.auth.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 카테고리 계층 정보를 제공하는 API 컨트롤러입니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 전체 최상위 카테고리 목록을 조회합니다.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        log.info("[Category] Fetching all root categories for menu");
        List<CategoryResponse> categories = categoryService.getRootCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}
