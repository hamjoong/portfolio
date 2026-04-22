package com.hjuk.devcodehub.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FindPwRequest {

  @NotBlank(message = "아이디는 필수입니다.")
  @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "아이디는 숫자와 영문자만 가능합니다.")
  private String loginId;

  @NotBlank(message = "이메일은 필수입니다.")
  @Email(message = "이메일 형식이 올바르지 않습니다.")
  private String email;

  @NotBlank(message = "연락처는 필수입니다.")
  @Pattern(regexp = "^[0-9-]*$", message = "연락처는 숫자와 하이픈(-)만 입력 가능합니다.")
  private String contact;

  private String newPassword;
}
