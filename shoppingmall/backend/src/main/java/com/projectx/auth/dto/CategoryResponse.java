package com.projectx.auth.dto;

import com.projectx.auth.domain.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 카테고리 계층 구조를 반환하기 위한 응답 DTO입니다.
 * [이유] 엔티티를 직접 반환할 경우 발생할 수 있는 순환 참조 및 
 * 지연 로딩 문제를 방지하고 필요한 데이터만 클라이언트에 전달하기 위함입니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private int displayOrder;
    private List<CategoryResponse> children;

    public static CategoryResponse from(Category category) {
        if (category == null) return null;
        
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .displayOrder(category.getDisplayOrder())
                .children(category.getChildren() != null ? 
                    category.getChildren().stream()
                        .map(CategoryResponse::from)
                        .collect(Collectors.toList()) : List.of())
                .build();
    }
}
