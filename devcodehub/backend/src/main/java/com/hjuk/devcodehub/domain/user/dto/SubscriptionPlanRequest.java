package com.hjuk.devcodehub.domain.user.dto;

import com.hjuk.devcodehub.domain.user.domain.SubscriptionPlan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SubscriptionPlanRequest {
  @NotNull(message = "구독 플랜은 필수입니다.")
  private SubscriptionPlan plan;

  @NotBlank(message = "imp_uid는 필수입니다.")
  private String impUid;

  @NotNull(message = "결제 금액은 필수입니다.")
  private Integer amount;
}
