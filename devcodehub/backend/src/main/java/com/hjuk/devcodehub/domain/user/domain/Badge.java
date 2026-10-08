package com.hjuk.devcodehub.domain.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** [Why] 사용자에게 부여되는 뱃지 정보를 관리하는 도메인 엔티티입니다. */
@Entity
@Table(name = "badges")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Badge {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BadgeConditionType conditionType;

  @Column(nullable = false)
  private int threshold;
}
