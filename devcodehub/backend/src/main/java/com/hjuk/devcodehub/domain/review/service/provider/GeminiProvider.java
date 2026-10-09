package com.hjuk.devcodehub.domain.review.service.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hjuk.devcodehub.domain.review.service.PromptEngineeringService;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiProvider implements AiProvider {

  private static final int RETRY_DELAY_MS = 1500;
  private static final int MAX_ATTEMPTS = 3;
  // [Why] 전체 상한(AiReviewService 90초) 안에 3번 시도가 들어가도록 시도당 읽기 시간을 짧게 둔다.
  // 정상 응답은 보통 10초 안팎이다.
  private static final Duration ATTEMPT_READ_TIMEOUT = Duration.ofSeconds(25);
  private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);

  private final RestClient geminiClient =
      RestClient.builder()
          .requestFactory(
              ClientHttpRequestFactoryBuilder.detect()
                  .build(
                      ClientHttpRequestFactorySettings.defaults()
                          .withConnectTimeout(CONNECT_TIMEOUT)
                          .withReadTimeout(ATTEMPT_READ_TIMEOUT)))
          .build();
  private final PromptEngineeringService promptService;
  private final ObjectMapper objectMapper;

  @Value("${app.ai.gemini.api-key}")
  private String apiKey;

  @Value("${app.ai.gemini.api-url}")
  private String apiUrl;

  @Value("${app.ai.gemini.model:gemini-1.5-flash}")
  private String model;

  @Override
  public String getName() {
    return "gemini";
  }

  @Override
  public boolean isAvailable() {
    return apiKey != null && !apiKey.isBlank();
  }

  @Override
  public Map<String, Object> review(String code, String language) {
    if (apiKey == null || apiKey.isBlank()) {
      log.error("Gemini API Key is missing");
      return Map.of("error", "AI 서비스 설정(API Key)이 누락되었습니다. 관리자에게 문의해 주세요.");
    }

    // [Why] 키를 URL 쿼리에 넣으면 예외 메시지·접근 로그로 새어 나가므로 헤더로 보낸다.
    String url = apiUrl + "/" + model + ":generateContent";
    String systemPrompt = promptService.getSystemPrompt();
    String userPrompt = promptService.buildUserPrompt(code, language);

    Map<String, Object> requestBody = Map.of(
        "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
        "contents", List.of(Map.of("parts", List.of(Map.of("text", userPrompt)))),
        "generationConfig", Map.of("responseMimeType", "application/json"));

    for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        Map<String, Object> response = geminiClient.post().uri(url)
            .header("x-goog-api-key", apiKey)
            .body(requestBody).retrieve().body(Map.class);

        if (response == null || !response.containsKey("candidates")) {
          throw new RuntimeException("Gemini API 응답 형식이 올바르지 않습니다.");
        }

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        String text = (String) parts.get(0).get("text");

        return objectMapper.readValue(text, Map.class);

      } catch (HttpClientErrorException.TooManyRequests e) {
        return Map.of("error", "AI 서비스의 일일 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.");
      } catch (RestClientException e) {
        if (!isTransient(e)) {
          log.error("Gemini review internal error: {}", e.getMessage(), e);
          return Map.of("error", "리뷰 분석 중 기술적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        // [Why] 503 과부하·게이트웨이 오류·타임아웃은 잠시 뒤 다시 하면 성공하는 일이 잦아 재시도한다.
        boolean timeout = !(e instanceof HttpServerErrorException);
        if (attempt >= MAX_ATTEMPTS) {
          log.warn("Gemini API 일시 오류로 {}회 모두 실패: {}", MAX_ATTEMPTS, e.getClass().getSimpleName());
          return Map.of("error", timeout
              ? "AI 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요."
              : "AI 서버가 현재 매우 바쁩니다. 잠시 후 다시 시도해 주세요.");
        }
        log.warn("Gemini API 일시 오류({}), 재시도합니다. ({}/{})",
            e.getClass().getSimpleName(), attempt, MAX_ATTEMPTS);
        try {
          Thread.sleep((long) RETRY_DELAY_MS * attempt);
        } catch (InterruptedException ie) {
          Thread.currentThread().interrupt();
          return Map.of("error", "리뷰 분석이 중단되었습니다. 잠시 후 다시 시도해 주세요.");
        }
      } catch (Exception e) {
        log.error("Gemini review internal error: {}", e.getMessage(), e);
        return Map.of("error", "리뷰 분석 중 기술적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }
    return Map.of("error", "리뷰 분석 요청이 실패했습니다.");
  }

  /**
   * [Why] 재시도할 일시 오류인지 판단한다. 서버 5xx뿐 아니라, 응답 본문을 읽다가 끊긴 경우도 Spring이 "Error while extracting
   * response"로 감싸므로 원인 사슬에 입출력 오류(타임아웃·연결 끊김)가 있는지 함께 본다.
   */
  private static boolean isTransient(RestClientException e) {
    if (e instanceof HttpServerErrorException) {
      return true;
    }
    for (Throwable t = e; t != null; t = t.getCause()) {
      if (t instanceof java.io.IOException) {
        return true;
      }
    }
    return false;
  }
}
