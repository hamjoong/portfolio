package com.hjuk.devcodehub.domain.chat.domain;

import lombok.Getter;

@Getter
public enum ChatMessageType {
  TALK("대화");

  private final String description;

  ChatMessageType(String inputDescription) {
    this.description = inputDescription;
  }
}
