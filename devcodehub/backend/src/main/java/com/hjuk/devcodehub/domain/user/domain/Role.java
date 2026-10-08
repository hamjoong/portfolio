package com.hjuk.devcodehub.domain.user.domain;

public enum Role {
  USER("USER", "일반 사용자"),
  SENIOR("SENIOR", "시니어 개발자"),
  ADMIN("ADMIN", "관리자"),
  GUEST("GUEST", "비회원");

  private final String key;
  private final String title;

  Role(String inputKey, String inputTitle) {
    this.key = inputKey;
    this.title = inputTitle;
  }

  public String getKey() {
    return key;
  }

  public String getTitle() {
    return title;
  }
}
