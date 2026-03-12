package com.projectx.auth.domain.repository;

import com.projectx.auth.domain.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 카테고리 데이터에 접근하는 Repository 인터페이스입니다.
 * [이유] 상위 카테고리부터 계층적으로 데이터를 추출하여 
 * 카테고리 메뉴를 구성하기 위함입니다.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    /**
     * 상위 카테고리가 없는 최상위 카테고리 목록을 정렬 순서에 따라 조회합니다.
     */
    List<Category> findByParentIsNullOrderByDisplayOrderAsc();
}
