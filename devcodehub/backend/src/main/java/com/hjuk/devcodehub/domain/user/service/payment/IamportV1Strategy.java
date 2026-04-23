package com.hjuk.devcodehub.domain.user.service.payment;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.Map;
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
  private static final int KEY_MASK_LENGTH = 4;
  private static final int TOKEN_LOG_LENGTH = 10;

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
  public Map<String, Object> getPaymentInfo(String impUid) {
    try {
      RestTemplate restTemplate = new RestTemplate();
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

      if (v1ApiKey == null || v1ApiKey.trim().isEmpty() || v1ApiSecret == null || v1ApiSecret.trim().isEmpty()) {
        log.error("CRITICAL: 포트원 V1 API 키 또는 시크릿이 설정되지 않았습니다.");
        throw new BusinessException("포트원 API 설정이 누락되었습니다. 환경 변수를 확인해주세요.", ErrorCode.INTERNAL_SERVER_ERROR);
      }

      log.info("PortOne V1 토큰 발급 시도. Key(앞{}자리): {}",
          KEY_MASK_LENGTH,
          v1ApiKey.length() > KEY_MASK_LENGTH ? v1ApiKey.substring(0, KEY_MASK_LENGTH) : "****");

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

      log.info("PortOne V1 토큰 발급 완료. 토큰(앞{}자리): {}",
          TOKEN_LOG_LENGTH,
          token.substring(0, Math.min(token.length(), TOKEN_LOG_LENGTH)));
      log.info("PortOne V1 결제 정보 조회 요청 URL: {}/payments/{}", apiUrl, impUid);

      HttpHeaders authHeaders = new HttpHeaders();
      authHeaders.set("Authorization", token);
      HttpEntity<String> authEntity = new HttpEntity<>(authHeaders);

      ResponseEntity<Map> responseEntity =
          restTemplate.exchange(
              apiUrl + "/payments/" + impUid, HttpMethod.GET, authEntity, Map.class);

      return (Map<String, Object>) responseEntity.getBody().get("response");
    } catch (org.springframework.web.client.HttpClientErrorException e) {
      log.error("PortOne V1 API 호출 실패 - 상태 코드: {}, 응답 본문: {}", e.getStatusCode(), e.getResponseBodyAsString());
      throw new BusinessException(
          "포트원 결제 조회에 실패했습니다 (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(),
          ErrorCode.INTERNAL_SERVER_ERROR);
    } catch (BusinessException e) {
      throw e;
    } catch (Exception e) {
      log.error("PortOne V1 조회 중 예외 발생: {}", e.getMessage(), e);
      throw new BusinessException(
          "결제 정보를 가져오는 중 오류가 발생했습니다: " + e.getMessage(),
          ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }
}
