package com.hjuk.devcodehub.domain.user.dto;

import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatsResponse {
  private SummaryStats summary;
  private List<DailyStat> dailySignups;
  private List<DailyStat> dailyPosts;
  private List<DailyStat> dailyReviews;
  private List<DailyRevenue> dailyRevenue;
  private Map<String, Long> userRoleDistribution;
  private Map<String, Long> aiModelDistribution;
  private Map<String, Long> boardTypeDistribution;

  @Getter
  @Builder
  public static class SummaryStats {
    private long totalUsers;
    private long todaySignups;
    private long totalPosts;
    private long totalReviews;
    private long totalRevenue;
    private long totalCommission;
  }

  @Getter
  @Builder
  public static class DailyStat {
    private String date;
    private long count;
  }

  @Getter
  @Builder
  public static class DailyRevenue {
    private String date;
    private long amount;
  }
}
