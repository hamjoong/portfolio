package com.hjuk.devcodehub.domain.review.service.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hjuk.devcodehub.domain.review.service.PromptEngineeringService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiProvider implements AiProvider {

  private static final int RETRY_DELAY_MS = 1500;
  private final RestClient.Builder restClientBuilder;
  private final PromptEngineeringService promptService;
  private final ObjectMapper objectMapper;

  @Value("${app.ai.gemini.api-key}")
  private String apiKey;

  @Value("${app.ai.gemini.model:gemini-1.5-flash}")
  private String model;

  @Override
  public String getName() {
    return "gemini";
  }

  @Override
  public Map<String, Object> review(String code, String language) {
    if (apiKey == null || apiKey.isBlank()) {
      log.error("Gemini API Key is missing");
      return Map.of("error", "AI 서비스 설정(API Key)이 누락되었습니다. 관리자에게 문의해 주세요.");
    }

    String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
    String systemPrompt = promptService.getSystemPrompt();
    String userPrompt = promptService.buildUserPrompt(code, language);

    Map<String, Object> requestBody = Map.of(
        "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
        "contents", List.of(Map.of("parts", List.of(Map.of("text", userPrompt)))),
        "generationConfig", Map.of("responseMimeType", "application/json"));

    int attempts = 0;
    while (attempts < 2) {
      try {
        Map<String, Object> response = restClientBuilder.build().post().uri(url)
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
      } catch (HttpServerErrorException.ServiceUnavailable e) {
        attempts++;
        if (attempts >= 2) {
          return Map.of("error", "AI 서버가 현재 매우 바쁩니다. 잠시 후 다시 시도해 주세요.");
        }
        log.warn("Gemini API 503 Service Unavailable, retrying... ({})", attempts);
        try {
          Thread.sleep(RETRY_DELAY_MS);
        } catch (InterruptedException ie) {
          Thread.currentThread().interrupt();
        }
      } catch (Exception e) {
        log.error("Gemini review internal error: {}", e.getMessage(), e);
        return Map.of("error", "리뷰 분석 중 기술적인 오류가 발생했습니다: " + e.getMessage());
      }
    }
    return Map.of("error", "리뷰 분석 요청이 실패했습니다.");
  }
}
