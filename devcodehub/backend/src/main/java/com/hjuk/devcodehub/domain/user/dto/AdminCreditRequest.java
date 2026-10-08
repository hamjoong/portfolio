package com.hjuk.devcodehub.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminCreditRequest {
  @NotNull(message = "조정 금액은 필수입니다.")
  private Integer amount;

  @NotBlank(message = "조정 사유는 필수입니다.")
  private String reason;
}
