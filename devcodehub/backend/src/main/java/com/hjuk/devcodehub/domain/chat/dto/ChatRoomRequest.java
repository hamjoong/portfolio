package com.hjuk.devcodehub.domain.chat.dto;

import com.hjuk.devcodehub.domain.chat.domain.ChatRoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChatRoomRequest {
  @NotBlank(message = "방 이름은 필수입니다.")
  private String name;

  @NotNull(message = "채팅 타입은 필수입니다.")
  private ChatRoomType type;

  @Size(min = 1, message = "대화 상대를 한 명 이상 선택해 주세요.")
  private List<String> participantLoginIds;
}
