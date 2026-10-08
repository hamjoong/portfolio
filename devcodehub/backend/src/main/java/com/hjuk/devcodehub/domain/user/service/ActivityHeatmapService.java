package com.hjuk.devcodehub.domain.user.service;

import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * [Why] GitHub '잔디'처럼 사용자의 하루 활동량을 보여 주기 위해 게시글·댓글·AI 리뷰·시니어 리뷰 건수를 날짜별로 집계합니다. 행을 모두
 * 읽지 않고 DB에서 GROUP BY로 집계합니다.
 */
@Service
@RequiredArgsConstructor
public class ActivityHeatmapService {

  private static final int MAX_DAYS = 365;

  private static final List<String> QUERIES =
      List.of(
          "SELECT FUNCTION('DATE', b.createdAt), COUNT(b) FROM Board b "
              + "WHERE b.author.loginId = :loginId AND b.createdAt >= :from GROUP BY FUNCTION('DATE', b.createdAt)",
          "SELECT FUNCTION('DATE', c.createdAt), COUNT(c) FROM Comment c "
              + "WHERE c.author.loginId = :loginId AND c.createdAt >= :from GROUP BY FUNCTION('DATE', c.createdAt)",
          "SELECT FUNCTION('DATE', r.createdAt), COUNT(r) FROM Review r "
              + "WHERE r.author.loginId = :loginId AND r.createdAt >= :from GROUP BY FUNCTION('DATE', r.createdAt)",
          "SELECT FUNCTION('DATE', q.createdAt), COUNT(q) FROM SeniorReviewRequest q "
              + "WHERE q.junior.loginId = :loginId AND q.createdAt >= :from GROUP BY FUNCTION('DATE', q.createdAt)",
          "SELECT FUNCTION('DATE', s.createdAt), COUNT(s) FROM SeniorReview s "
              + "WHERE s.senior.loginId = :loginId AND s.createdAt >= :from GROUP BY FUNCTION('DATE', s.createdAt)");

  private final EntityManager entityManager;

  /**
   * 최근 N일의 날짜별 활동 건수를 돌려줍니다. 활동이 없는 날은 포함하지 않습니다.
   *
   * @param loginId 사용자 로그인 ID
   * @param days 조회 일수 (1~365)
   * @return 날짜(yyyy-MM-dd) 오름차순의 [날짜, 건수] 목록
   */
  @Transactional(readOnly = true)
  public List<Map<String, Object>> getHeatmap(String loginId, int days) {
    int range = Math.min(Math.max(days, 1), MAX_DAYS);
    java.time.LocalDateTime from = LocalDate.now().minusDays(range - 1L).atStartOfDay();

    Map<String, Long> countByDate = new TreeMap<>();
    for (String jpql : QUERIES) {
      @SuppressWarnings("unchecked")
      List<Object[]> rows =
          entityManager
              .createQuery(jpql)
              .setParameter("loginId", loginId)
              .setParameter("from", from)
              .getResultList();
      for (Object[] row : rows) {
        countByDate.merge(String.valueOf(row[0]), ((Number) row[1]).longValue(), Long::sum);
      }
    }

    return countByDate.entrySet().stream()
        .map(e -> Map.<String, Object>of("date", e.getKey(), "count", e.getValue()))
        .toList();
  }
}
