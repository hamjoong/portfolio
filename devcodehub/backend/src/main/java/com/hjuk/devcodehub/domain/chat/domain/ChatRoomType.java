package com.hjuk.devcodehub.domain.chat.domain;

import lombok.Getter;

@Getter
public enum ChatRoomType {
  SINGLE("1:1 채팅"),
  GROUP("단체 채팅");

  private final String description;

  ChatRoomType(String inputDescription) {
    this.description = inputDescription;
  }
}
