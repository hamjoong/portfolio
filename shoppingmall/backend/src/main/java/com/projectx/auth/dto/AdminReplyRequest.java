package com.projectx.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 관리자 답변 등록을 위한 요청 DTO입니다.
 */
@Getter
@Setter
@NoArgsConstructor
public class AdminReplyRequest {
    private String content;
}
