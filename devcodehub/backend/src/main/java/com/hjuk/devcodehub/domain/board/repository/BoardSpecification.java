package com.hjuk.devcodehub.domain.board.repository;

import com.hjuk.devcodehub.domain.board.domain.Board;
import com.hjuk.devcodehub.domain.board.domain.BoardType;
import com.hjuk.devcodehub.domain.board.service.BoardKeywordService;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/** [Why] 게시판 검색을 위한 Specification을 생성하는 유틸리티 클래스입니다. */
public final class BoardSpecification {

  private BoardSpecification() {
    throw new UnsupportedOperationException("Utility class");
  }

  /**
   * [Why] 타입, 키워드, 태그를 기반으로 게시글을 필터링합니다.
   *
   * @param type 게시판 타입
   * @param keyword 검색 키워드
   * @param tag 태그
   * @param boardKeywordService 키워드 관련 서비스
   * @return 게시글 Specification 객체
   */
  public static Specification<Board> filterByTypeKeywordTag(
      BoardType type, String keyword, String tag, BoardKeywordService boardKeywordService) {

    return (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();
      predicates.add(cb.equal(root.get("type"), type));

      if (tag != null && !tag.isBlank()) {
        predicates.add(cb.isMember(tag, root.get("tags")));
      }

      if (keyword != null && !keyword.isBlank()) {
        String[] keywords = keyword.trim().split("\\s+");
        List<Predicate> keywordPredicates = new ArrayList<>();

        for (String k : keywords) {
          if (k.isBlank()) {
            continue;
          }

          String pattern = "%" + k.toLowerCase() + "%";
          // 제목 또는 내용에 키워드가 포함되는지 확인 (OR 연산)
          keywordPredicates.add(
              cb.or(
                  cb.like(cb.lower(root.get("title").as(String.class)), pattern),
                  cb.like(cb.lower(root.get("content").as(String.class)), pattern)));
        }
        // 모든 키워드 조건들 사이를 OR로 연결하여 하나라도 만족하면 검색되도록 함
        predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
      }

      query.distinct(true);
      return cb.and(predicates.toArray(new Predicate[0]));
    };
  }
}
