package com.hjuk.devcodehub.domain.user.repository;

import com.hjuk.devcodehub.domain.user.domain.CreditTransaction;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
  Page<CreditTransaction> findByUserLoginIdOrderByCreatedAtDesc(String loginId, Pageable pageable);

  @org.springframework.data.jpa.repository.Query(
      "SELECT FUNCTION('DATE', ct.createdAt) as date, SUM(ct.amount) as amount FROM CreditTransaction ct "
          + "WHERE ct.type = 'RECHARGE' AND ct.createdAt >= :startDate "
          + "GROUP BY FUNCTION('DATE', ct.createdAt) "
          + "ORDER BY FUNCTION('DATE', ct.createdAt) ASC")
  List<Object[]> sumDailyRecharge(
      @org.springframework.data.repository.query.Param("startDate")
          java.time.LocalDateTime startDate);

  @org.springframework.data.jpa.repository.Query(
      "SELECT SUM(ct.amount) FROM CreditTransaction ct WHERE ct.type = 'RECHARGE'")
  Long sumTotalRevenue();
}
