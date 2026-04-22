package com.hjuk.devcodehub.domain.board.domain;

public enum BoardType {
  SKILL("SKILL", "IT 기술"),
  AI("AI", "AI 정보");

  private final String key;
  private final String title;

  BoardType(String inputKey, String inputTitle) {
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
