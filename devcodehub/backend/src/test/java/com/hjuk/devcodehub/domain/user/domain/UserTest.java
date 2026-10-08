package com.hjuk.devcodehub.domain.user.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserTest {

  @Test
  @DisplayName("경험치 누적에 따른 레벨업 계산이 정상적으로 수행되어야 함")
  void addExperience_LevelUpTest() {
    // given
    User user =
        User.builder()
            .loginId("test")
            .nickname("tester")
            .email("test@test.com")
            .role(Role.USER)
            .build();

    // Level 1에서 시작 (필요 XP: 100)
    // when: 150 XP 획득 -> 150 / 100 = 레벨 1 증가, 경험치 50 남음
    user.addExperience(150);

    // then
    assertEquals(2, user.getLevel(), "레벨이 2가 되어야 함");
    assertEquals(50, user.getExperience(), "잔여 경험치가 50이어야 함");

    // when: 추가로 200 XP 획득 (총 250 XP 됨)
    // Level 2 필요 XP: 200 (Level * 100)
    // 잔여 50 + 200 = 250 XP -> 200 XP 소모하여 레벨 3 증가, 경험치 50 남음
    user.addExperience(200);

    assertEquals(3, user.getLevel(), "레벨이 3이 되어야 함");
    assertEquals(50, user.getExperience(), "잔여 경험치가 50이어야 함");
  }
}
