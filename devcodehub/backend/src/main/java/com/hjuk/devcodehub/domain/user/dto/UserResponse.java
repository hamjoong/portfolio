package com.hjuk.devcodehub.domain.user.dto;

import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.global.util.MaskingUtil;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** [Why] 사용자 정보 응답 DTO입니다. */
@Getter
@Setter
@NoArgsConstructor
public class UserResponse {

  private static final int INITIAL_RANKING = 12;

  private Long id;
  private String loginId;
  private String nickname;
  private String email;
  private String contact;
  private String address;
  private Role role;
  private int credits;
  private int totalSpentCredits;
  private int weeklyFreeReviewUsed;
  private int maxWeeklyFreeLimit;
  private int level;
  private int experience;
  private int ranking;
  private String profileImageUrl;
  private String avatarUrl;
  private java.util.List<BadgeDto> badges;

  public UserResponse(User user) {
    this(user, true); // 기본적으로 보안을 위해 마스킹 처리 적용
  }

  public UserResponse(User user, boolean isMasked) {
    this.id = user.getId();
    this.loginId = user.getLoginId();
    this.nickname = user.getNickname();
    this.email = isMasked ? MaskingUtil.maskEmail(user.getEmail()) : user.getEmail();
    this.contact = isMasked ? MaskingUtil.maskContact(user.getContact()) : user.getContact();
    this.address = isMasked ? MaskingUtil.maskAddress(user.getAddress()) : user.getAddress();
    this.role = user.getRole();
    this.credits = user.getCredits();
    this.totalSpentCredits = user.getTotalSpentCredits();
    this.weeklyFreeReviewUsed = user.getWeeklyFreeReviewUsed();
    this.maxWeeklyFreeLimit = user.getMaxWeeklyFreeLimit();
    this.level = user.getLevel();
    this.experience = user.getExperience();
    this.ranking = INITIAL_RANKING;
    this.profileImageUrl = user.getProfileImageUrl();
    this.avatarUrl = user.getAvatarUrl();
    this.badges =
        user.getBadges().stream().map(BadgeDto::new).collect(java.util.stream.Collectors.toList());
  }

  @Getter
  public static class BadgeDto {
    private final String name;
    private final String description;

    public BadgeDto(com.hjuk.devcodehub.domain.user.domain.Badge inputBadge) {
      this.name = inputBadge.getName();
      this.description = inputBadge.getDescription();
    }
  }
}
