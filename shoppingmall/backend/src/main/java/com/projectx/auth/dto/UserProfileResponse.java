package com.projectx.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자의 프로필 정보를 반환하기 위한 응답 객체입니다.
 * [이유] 복호화된 실명과 연락처를 클라이언트에게 안전하게 전달하여
 * 마이페이지 등에서 사용자 정보를 표시하기 위함입니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String email;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String detailAddress;
}
