package com.hjuk.devcodehub.domain.user.service.payment;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** [Why] PortOne V2 API를 사용하여 결제 정보를 조회하고 서비스를 위해 정규화합니다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class PortoneV2Strategy implements PaymentStrategy {

  private final RestClient.Builder restClientBuilder;

  @Value("${app.portone.v2.api-secret:}")
  private String v2ApiSecret;

  @Value("${app.portone.v2.api-url}")
  private String apiUrl;

  @Override
  public boolean supports(String paymentId) {
    return !paymentId.startsWith("imp_");
  }

  /**
   * [Why] 결제 ID로 포트원 V2 상세 정보를 조회하고 V1 호환 구조로 변환합니다.
   *
   * @param paymentId 결제 고유 ID
   * @return 정규화된 결제 정보 맵
   */
  @Override
  @SuppressWarnings("unchecked")
  public Map<String, Object> getPaymentInfo(String paymentId) {
    try {
      log.info("PortOne V2 결제 정보 상세 조회 시도. ID: {}", paymentId);
      Map<String, Object> response =
          restClientBuilder
              .build()
              .get()
              .uri(apiUrl + "/payments/" + paymentId) // Sandbox가 아닌 공식 API URL 사용
              .headers(
                  h -> {
                    String authHeader = "PortOne " + v2ApiSecret.trim();
                    h.set("Authorization", authHeader);
                  })
              .retrieve()
              .body(Map.class);

      if (response == null) {
        throw new BusinessException("포트원 V2 응답이 비어 있습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
      }

      // V2 응답 구조(amount: { total: ... })를 V1 구조(amount: ...)로 정규화
      if (response.containsKey("amount")) {
        Map<String, Object> amountData = (Map<String, Object>) response.get("amount");
        if (amountData != null && amountData.containsKey("total")) {
          // PaymentService와의 호환성을 위해 Integer로 변환하여 상위에 저장
          response.put("amount", amountData.get("total"));
        }
      }

      log.info("PortOne V2 결제 정보 응답 성공. 상태: {}, 금액: {}",
          response.get("status"), response.get("amount"));
      return response;
    } catch (Exception e) {
      log.error("PortOne V2 조회 실패 - ID: {}, Error: {}", paymentId, e.getMessage());
      throw new BusinessException("포트원 결제 정보를 찾을 수 없습니다 (V2).", ErrorCode.ENTITY_NOT_FOUND);
    }
  }
}
