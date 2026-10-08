package com.hjuk.devcodehub.domain.user.service.payment;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class IamportV1Strategy implements PaymentStrategy {
  @Value("${app.portone.v1.api-key:}")
  private String v1ApiKey;

  @Value("${app.portone.v1.api-secret:}")
  private String v1ApiSecret;

  @Value("${app.portone.v1.api-url}")
  private String apiUrl;

  @Override
  public boolean supports(String paymentId) {
    return paymentId.startsWith("imp_");
  }

  @Override
  public PaymentInfo getPaymentInfo(String impUid) {
    try {
      RestTemplate restTemplate = new RestTemplate();
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

      if (v1ApiKey == null || v1ApiKey.trim().isEmpty() || v1ApiSecret == null || v1ApiSecret.trim().isEmpty()) {
        log.error("CRITICAL: 포트원 V1 API 키 또는 시크릿이 설정되지 않았습니다.");
        throw new BusinessException("포트원 API 설정이 누락되었습니다. 환경 변수를 확인해주세요.", ErrorCode.INTERNAL_SERVER_ERROR);
      }

      MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
      body.add("imp_key", v1ApiKey.trim());
      body.add("imp_secret", v1ApiSecret.trim());

      HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

      Map<String, Object> authResponse =
          restTemplate.postForObject(apiUrl + "/users/getToken", entity, Map.class);

      if (authResponse == null || authResponse.get("response") == null) {
        throw new BusinessException("포트원 V1 토큰 발급 실패", ErrorCode.INTERNAL_SERVER_ERROR);
      }

      String token =
          (String) ((Map<String, Object>) authResponse.get("response")).get("access_token");

      log.info("PortOne V1 결제 정보 조회 요청. ID: {}", impUid);

      HttpHeaders authHeaders = new HttpHeaders();
      authHeaders.set("Authorization", token);
      HttpEntity<String> authEntity = new HttpEntity<>(authHeaders);

      ResponseEntity<Map> responseEntity =
          restTemplate.exchange(
              apiUrl + "/payments/" + impUid, HttpMethod.GET, authEntity, Map.class);

      Map<String, Object> payment = (Map<String, Object>) responseEntity.getBody().get("response");
      Object amount = payment != null ? payment.get("amount") : null;
      if (!(amount instanceof Number number)) {
        throw new BusinessException("결제 금액을 확인할 수 없습니다.", ErrorCode.INVALID_INPUT_VALUE);
      }
      Set<String> ownerRefs = new HashSet<>();
      if (payment.get("custom_data") instanceof String json) {
        ownerRefs.add(PaymentOwnerParser.fromCustomData(json));
      }
      ownerRefs.remove(null);
      return new PaymentInfo(
          impUid, number.intValue(), "paid".equals(payment.get("status")), ownerRefs);
    } catch (org.springframework.web.client.HttpClientErrorException e) {
      log.error("PortOne V1 API 호출 실패 - 상태 코드: {}, 응답 본문: {}", e.getStatusCode(), e.getResponseBodyAsString());
      throw new BusinessException("포트원 결제 조회에 실패했습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
    } catch (BusinessException e) {
      throw e;
    } catch (Exception e) {
      log.error("PortOne V1 조회 중 예외 발생: {}", e.getMessage(), e);
      throw new BusinessException(
          "결제 정보를 가져오는 중 오류가 발생했습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }
}
