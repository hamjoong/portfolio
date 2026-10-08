package com.hjuk.devcodehub.domain.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "users",
    indexes = {
      @Index(name = "idx_user_email", columnList = "email"),
      @Index(name = "idx_user_nickname", columnList = "nickname")
    })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class User {

  private static final int DEFAULT_INITIAL_CREDITS = 500;
  private static final int CREDIT_THRESHOLD_FOR_LIMIT = 1000;
  private static final int MAX_ADDITIONAL_LIMIT = 15;
  private static final int DEFAULT_MAX_WEEKLY_FREE_LIMIT = 5;
  private static final int EXP_PER_LEVEL_FACTOR = 100;
  private static final int ADDRESS_MAX_LENGTH = 500;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String loginId;

  @Column(nullable = false)
  private String nickname;

  @Column(nullable = false)
  private String email;

  private String password;

  private String contact;

  @Column(length = ADDRESS_MAX_LENGTH)
  private String address;

  private String profileImageUrl;

  private String avatarUrl;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role;

  @Column(nullable = false)
  private int credits;

  @Column(nullable = false)
  private int totalSpentCredits;

  @Column(nullable = false)
  private int weeklyFreeReviewUsed;

  @Column(nullable = false)
  private int maxWeeklyFreeLimit;

  private String provider;

  private String providerId;

  @Column(nullable = false)
  private int level = 1;

  @Column(nullable = false)
  private int experience = 0;

  private LocalDateTime createdAt;

  @ManyToMany
  @JoinTable(
      name = "user_badges",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "badge_id"))
  private List<Badge> badges = new ArrayList<>();

  @Builder
  @SuppressWarnings({"checkstyle:ParameterNumber", "checkstyle:HiddenField"})
  public User(
      String loginId,
      String nickname,
      String email,
      String password,
      String contact,
      String address,
      Role role,
      Integer credits,
      String provider,
      String providerId) {
    this.loginId = loginId;
    this.nickname = nickname;
    this.email = email;
    this.password = password;
    this.contact = contact;
    this.address = address;
    this.role = role;
    this.credits = (credits != null) ? credits : DEFAULT_INITIAL_CREDITS;
    this.totalSpentCredits = 0;
    this.weeklyFreeReviewUsed = 0;
    this.maxWeeklyFreeLimit = (role == Role.GUEST) ? 0 : DEFAULT_MAX_WEEKLY_FREE_LIMIT;
    this.provider = provider;
    this.providerId = providerId;
    this.level = 1;
    this.experience = 0;
    this.badges = new ArrayList<>();
    this.createdAt = LocalDateTime.now();
  }

  public void addExperience(int amount) {
    this.experience += amount;
    while (this.experience >= this.level * EXP_PER_LEVEL_FACTOR) {
      this.experience -= (this.level * EXP_PER_LEVEL_FACTOR);
      this.level++;
    }
  }

  public void addBadge(Badge badge) {
    if (!this.badges.contains(badge)) {
      this.badges.add(badge);
    }
  }

  public void updateProfile(
      String inputNickname, String inputEmail, String inputContact, String inputAddress) {
    if (inputNickname != null) {
      this.nickname = inputNickname;
    }
    if (inputEmail != null) {
      this.email = inputEmail;
    }
    if (inputContact != null) {
      this.contact = inputContact;
    }
    if (inputAddress != null) {
      this.address = inputAddress;
    }
  }

  public void updatePassword(String encodedPassword) {
    this.password = encodedPassword;
  }

  public void updateProfileImage(String inputProfileImageUrl) {
    this.profileImageUrl = inputProfileImageUrl;
    this.avatarUrl = null;
  }

  public void updateAvatar(String inputAvatarUrl) {
    this.avatarUrl = inputAvatarUrl;
    this.profileImageUrl = null;
  }

  public void updateRole(Role inputRole) {
    if (inputRole != null) {
      this.role = inputRole;
    }
  }

  public void deductCredits(int amount) {
    if (this.credits < amount) {
      throw new com.hjuk.devcodehub.global.error.exception.BusinessException(
          "잔여 크레딧이 부족합니다.",
          com.hjuk.devcodehub.global.error.exception.ErrorCode.INVALID_INPUT_VALUE);
    }
    this.credits -= amount;
    this.totalSpentCredits += amount;

    int additionalLimit =
        Math.min(this.totalSpentCredits / CREDIT_THRESHOLD_FOR_LIMIT, MAX_ADDITIONAL_LIMIT);
    this.maxWeeklyFreeLimit = DEFAULT_MAX_WEEKLY_FREE_LIMIT + additionalLimit;
  }

  /**
   * [Why] 무료 리뷰 사용량을 늘린다. 한도(기본 + 구독 혜택)는 호출하는 서비스가 계산해서 넘기는 개수로 이미 제한하므로, 엔티티가 기본
   * 한도만 보고 구독자를 막지 않도록 여기서는 한도를 검사하지 않는다.
   *
   * @param count 사용한 무료 리뷰 횟수
   */
  public void consumeFreeReviews(int count) {
    this.weeklyFreeReviewUsed += count;
  }

  public void addCredits(int amount) {
    this.credits += amount;
  }
}
