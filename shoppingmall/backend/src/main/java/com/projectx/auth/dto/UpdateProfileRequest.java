package com.projectx.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 프로필 정보를 수정하기 위한 요청 객체입니다.
 * [이유] 클라이언트로부터 변경하고자 하는 실명과 연락처를 전달받아
 * KMS를 통해 다시 암호화하여 저장하기 위함입니다.
 */
@Getter
@NoArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "이름은 필수 입력 값입니다.")
    private String fullName;

    @NotBlank(message = "전화번호는 필수 입력 값입니다.")
    private String phoneNumber;

    private String address;
    private String detailAddress;
}
