package com.hjuk.devcodehub.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** [Why] 사용자 정보 수정 요청을 위한 DTO입니다. */
@Getter
@Setter
@NoArgsConstructor
public class UserUpdateRequest {

  private static final int MAX_ADDRESS_LENGTH = 500;

  @Pattern(regexp = "^[a-zA-Z0-9가-힣]*$", message = "닉네임은 숫자, 영문자, 한글만 가능합니다.")
  @Size(max = 20, message = "닉네임은 20자 이하여야 합니다.")
  private String nickname;

  @Email(message = "이메일 형식이 올바르지 않습니다.")
  private String email;

  @Pattern(regexp = "^[0-9-]*$", message = "연락처는 숫자와 하이픈(-)만 입력 가능합니다.")
  private String contact;

  @Size(max = MAX_ADDRESS_LENGTH)
  @Pattern(regexp = "^[a-zA-Z0-9가-힣\\s,\\-\\(\\)\\.]*$")
  private String address;

  /** 비밀번호를 바꿀 때만 입력합니다. 공백이 없어야 합니다. */
  @Pattern(regexp = "^\\S*$", message = "비밀번호에는 공백이 포함될 수 없습니다.")
  private String password;

  /** [Why] 탈취된 세션으로 비밀번호를 바꾸는 것을 막기 위해 변경 시 현재 비밀번호를 확인한다. */
  private String currentPassword;

  private String profileImageUrl;
  private String avatarUrl;
}
