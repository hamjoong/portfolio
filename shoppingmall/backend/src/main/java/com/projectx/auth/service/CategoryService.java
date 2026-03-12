package com.projectx.auth.service;

import com.projectx.auth.dto.CategoryResponse;
import com.projectx.auth.domain.entity.Category;
import com.projectx.auth.domain.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 카테고리 계층 정보를 처리하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * 메인 메뉴 구성을 위해 최상위 카테고리 목록을 조회하여 DTO로 변환합니다.
     * [이유] 트랜잭션 내부에서 DTO로 변환함으로써 지연 로딩(Lazy Loading)된 
     * 하위 카테고리 데이터까지 안전하게 로드하기 위함입니다.
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNullOrderByDisplayOrderAsc().stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }
}
