package com.hjuk.devcodehub.domain.board.dto;

import com.hjuk.devcodehub.domain.board.domain.BoardType;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BoardRequest {
  @NotBlank(message = "제목은 필수입니다.")
  private String title;

  @NotBlank(message = "내용은 필수입니다.")
  private String content;

  private BoardType type;
  private List<String> tags;
}
