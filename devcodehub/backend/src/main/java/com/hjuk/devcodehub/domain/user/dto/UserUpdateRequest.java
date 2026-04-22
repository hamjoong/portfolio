package com.hjuk.devcodehub.domain.user.dto;

import com.hjuk.devcodehub.domain.user.domain.Role;
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

  private String nickname;
  private String email;
  private String contact;

  @Size(max = MAX_ADDRESS_LENGTH)
  @Pattern(regexp = "^[a-zA-Z0-9가-힣\\s,\\-\\(\\)\\.]*$")
  private String address;

  private String password;

  private String profileImageUrl;
  private String avatarUrl;
  private Role role;
}
