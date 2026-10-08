package com.hjuk.devcodehub.domain.user.service.payment;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
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
   * [Why] 결제 ID로 포트원 V2 상세 정보를 조회하고 서비스용 구조로 정규화합니다.
   *
   * @param paymentId 결제 고유 ID
   * @return 정규화된 결제 정보
   */
  @Override
  @SuppressWarnings("unchecked")
  public PaymentInfo getPaymentInfo(String paymentId) {
    try {
      Map<String, Object> response =
          restClientBuilder
              .build()
              .get()
              .uri(
                  apiUrl
                      + "/payments/"
                      + java.net.URLEncoder.encode(paymentId, java.nio.charset.StandardCharsets.UTF_8))
              .headers(h -> h.set("Authorization", "PortOne " + v2ApiSecret.trim()))
              .retrieve()
              .body(Map.class);

      if (response == null) {
        throw new BusinessException("포트원 V2 응답이 비어 있습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
      }

      Map<String, Object> amountData = (Map<String, Object>) response.get("amount");
      Object total = amountData != null ? amountData.get("total") : null;
      if (!(total instanceof Number number)) {
        throw new BusinessException("결제 금액을 확인할 수 없습니다.", ErrorCode.INVALID_INPUT_VALUE);
      }

      Set<String> ownerRefs = new HashSet<>();
      // [Why] 프론트가 requestPayment의 customData(JSON)와 customer.customerId에 loginId를 실어 보낸다.
      Object customData = response.get("customData");
      if (customData instanceof String json) {
        ownerRefs.add(PaymentOwnerParser.fromCustomData(json));
      }
      Object customer = response.get("customer");
      if (customer instanceof Map<?, ?> customerMap && customerMap.get("id") instanceof String id) {
        ownerRefs.add(id);
      }
      ownerRefs.remove(null);

      log.info("PortOne V2 결제 조회 성공. 상태: {}, 금액: {}", response.get("status"), number.intValue());
      return new PaymentInfo(
          paymentId, number.intValue(), "PAID".equals(response.get("status")), ownerRefs);
    } catch (BusinessException e) {
      throw e;
    } catch (Exception e) {
      log.error("PortOne V2 조회 실패 - ID: {}, Error: {}", paymentId, e.getMessage());
      throw new BusinessException("포트원 결제 정보를 찾을 수 없습니다 (V2).", ErrorCode.ENTITY_NOT_FOUND);
    }
  }
}
