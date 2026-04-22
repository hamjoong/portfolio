package com.hjuk.devcodehub.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PaymentValidationRequest {
  @NotBlank(message = "imp_uid는 필수입니다.")
  private String impUid;

  @NotBlank(message = "merchant_uid는 필수입니다.")
  private String merchantUid;

  @NotNull(message = "결제 금액은 필수입니다.")
  private Integer amount;
}
