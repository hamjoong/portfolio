package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.board.repository.BoardRepository;
import com.hjuk.devcodehub.domain.review.repository.ReviewRepository;
import com.hjuk.devcodehub.domain.user.dto.AdminStatsResponse;
import com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminStatsService {

  private final UserRepository userRepository;
  private final BoardRepository boardRepository;
  private final ReviewRepository reviewRepository;
  private final CreditTransactionRepository creditTransactionRepository;

  public AdminStatsResponse getStats(int days) {
    LocalDateTime startDate = LocalDateTime.now().minusDays(days).with(LocalTime.MIN);
    LocalDateTime todayStart = LocalDate.now().atStartOfDay();

    // Summary
    long totalUsers = userRepository.count();
    long todaySignups =
        userRepository.countDailySignups(todayStart).stream().mapToLong(row -> (long) row[1]).sum();
    long totalPosts = boardRepository.count();
    long totalReviews = reviewRepository.count();
    Long revenue = creditTransactionRepository.sumTotalRevenue();
    long totalRevenue = revenue != null ? revenue : 0L;

    // Daily Stats
    List<AdminStatsResponse.DailyStat> dailySignups =
        userRepository.countDailySignups(startDate).stream()
            .map(
                row ->
                    AdminStatsResponse.DailyStat.builder()
                        .date(row[0].toString())
                        .count((long) row[1])
                        .build())
            .collect(Collectors.toList());

    List<AdminStatsResponse.DailyStat> dailyPosts =
        boardRepository.countDailyPosts(startDate).stream()
            .map(
                row ->
                    AdminStatsResponse.DailyStat.builder()
                        .date(row[0].toString())
                        .count((long) row[1])
                        .build())
            .collect(Collectors.toList());

    List<AdminStatsResponse.DailyStat> dailyReviews =
        reviewRepository.countDailyReviews(startDate).stream()
            .map(
                row ->
                    AdminStatsResponse.DailyStat.builder()
                        .date(row[0].toString())
                        .count((long) row[1])
                        .build())
            .collect(Collectors.toList());

    List<AdminStatsResponse.DailyRevenue> dailyRevenue =
        creditTransactionRepository.sumDailyRecharge(startDate).stream()
            .map(
                row ->
                    AdminStatsResponse.DailyRevenue.builder()
                        .date(row[0].toString())
                        .amount((long) row[1])
                        .build())
            .collect(Collectors.toList());

    // Distribution
    Map<String, Long> roleDistribution =
        userRepository.countUsersByRole().stream()
            .collect(Collectors.toMap(row -> row[0].toString(), row -> (long) row[1]));

    Map<String, Long> modelDistribution =
        reviewRepository.countReviewsByModel().stream()
            .collect(Collectors.toMap(row -> row[0].toString(), row -> (long) row[1]));

    Map<String, Long> boardDistribution =
        boardRepository.countBoardsByType().stream()
            .collect(Collectors.toMap(row -> row[0].toString(), row -> (long) row[1]));

    return AdminStatsResponse.builder()
        .summary(
            AdminStatsResponse.SummaryStats.builder()
                .totalUsers(totalUsers)
                .todaySignups(todaySignups)
                .totalPosts(totalPosts)
                .totalReviews(totalReviews)
                .totalRevenue(totalRevenue)
                .build())
        .dailySignups(dailySignups)
        .dailyPosts(dailyPosts)
        .dailyReviews(dailyReviews)
        .dailyRevenue(dailyRevenue)
        .userRoleDistribution(roleDistribution)
        .aiModelDistribution(modelDistribution)
        .boardTypeDistribution(boardDistribution)
        .build();
  }
}
