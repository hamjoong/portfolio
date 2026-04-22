package com.hjuk.devcodehub.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
  private String accessToken;
  private Long id;
  private String loginId;
  private String nickname;
  private String role;
  private int credits;
  private int totalSpentCredits;
  private int weeklyFreeReviewUsed;
  private int maxWeeklyFreeLimit;
  private String profileImageUrl;
  private String avatarUrl;
}
