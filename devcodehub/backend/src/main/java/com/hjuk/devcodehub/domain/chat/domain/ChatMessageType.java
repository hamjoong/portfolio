package com.hjuk.devcodehub.domain.chat.domain;

import lombok.Getter;

@Getter
public enum ChatMessageType {
  ENTER("입장"),
  TALK("대화"),
  LEAVE("퇴장");

  private final String description;

  ChatMessageType(String inputDescription) {
    this.description = inputDescription;
  }
}
