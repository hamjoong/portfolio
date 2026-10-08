package com.hjuk.devcodehub.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoginRequest {
  @NotBlank(message = "아이디는 필수입니다.")
  @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "아이디는 숫자와 영문자만 가능합니다.")
  private String loginId;

  @NotBlank(message = "비밀번호는 필수입니다.")
  @Pattern(regexp = "^\\S*$", message = "비밀번호에는 공백이 포함될 수 없습니다.")
  private String password;
}
