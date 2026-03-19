package com.projectx.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원가입 요청 시 사용하는 데이터 전송 객체입니다.
 * [이유] 클라이언트로부터 전달받은 가입 정보를 검증하고,
 * 서비스 레이어에 필요한 데이터(인증 정보 + 프로필)를 구조화하여 전달하기 위함입니다.
 */
@Getter
@NoArgsConstructor
public class SignupRequest {

    @NotBlank(message = "이메일은 필수 입력 값입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    private String password;

    @NotBlank(message = "이름은 필수 입력 값입니다.")
    private String fullName;

    @NotBlank(message = "전화번호는 필수 입력 값입니다.")
    private String phoneNumber;

    @NotBlank(message = "주소는 필수 입력 값입니다.")
    private String address;

    @NotBlank(message = "상세 주소는 필수 입력 값입니다.")
    private String detailAddress;
}
