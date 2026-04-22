package com.hjuk.devcodehub.domain.user.dto;

import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** [Why] 회원가입 요청을 처리하기 위한 DTO입니다. */
@Getter
@Setter
@NoArgsConstructor
public class SignupRequest {

  private static final int MAX_ADDRESS_LENGTH = 500;

  @NotBlank(message = "아이디는 필수입니다.")
  @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "아이디는 숫자와 영문자만 가능합니다.")
  private String loginId;

  @NotBlank(message = "닉네임은 필수입니다.")
  @Pattern(regexp = "^[a-zA-Z0-9가-힣]*$", message = "닉네임은 숫자, 영문자, 한글만 가능합니다.")
  private String nickname;

  @NotBlank(message = "이메일은 필수입니다.")
  @Email(message = "이메일 형식이 올바르지 않습니다.")
  private String email;

  @NotBlank(message = "비밀번호는 필수입니다.")
  @Pattern(regexp = "^\\S*$", message = "비밀번호에는 공백이 포함될 수 없습니다.")
  private String password;

  @Pattern(regexp = "^[0-9-]*$", message = "연락처는 숫자와 하이픈(-)만 입력 가능합니다.")
  private String contact;

  @Size(max = MAX_ADDRESS_LENGTH, message = "주소는 최대 500자까지 입력 가능합니다.")
  @Pattern(regexp = "^[a-zA-Z0-9가-힣\\s,\\-\\(\\)\\.]*$", message = "주소에 허용되지 않는 특수문자가 포함되어 있습니다.")
  private String address;

  public User toEntity(String encodedPassword) {
    return User.builder()
        .loginId(loginId)
        .nickname(nickname)
        .email(email)
        .password(encodedPassword)
        .contact(contact)
        .address(address)
        .role(Role.USER)
        .build();
  }
}
