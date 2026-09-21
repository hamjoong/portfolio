package com.projectx.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindPasswordRequest {
    @NotBlank(message = "아이디(이메일)를 입력해주세요.")
    private String email;
    @NotBlank(message = "이름을 입력해주세요.")
    private String fullName;
    @NotBlank(message = "전화번호를 입력해주세요.")
    private String phoneNumber;
}
