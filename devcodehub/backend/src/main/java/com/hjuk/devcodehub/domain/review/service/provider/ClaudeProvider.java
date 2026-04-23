package com.hjuk.devcodehub.domain.review.service.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hjuk.devcodehub.domain.review.service.PromptEngineeringService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * [Why] Anthropic Claude AI 모델을 이용한 리뷰 제공자입니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ClaudeProvider implements AiProvider {

  private static final int MAX_TOKENS = 4096;

  private final RestClient.Builder restClientBuilder;
  private final PromptEngineeringService promptService;
  private final ObjectMapper objectMapper;

  @Value("${app.ai.claude.api-url}")
  private String apiUrl;

  @Value("${app.ai.claude.api-key}")
  private String apiKey;

  @Value("${app.ai.claude.model:claude-3-5-sonnet-20240620}")
  private String model;

  @Override
  public String getName() {
    return "claude";
  }

  /**
   * [Why] 코드를 입력받아 Claude 모델을 통해 리뷰를 수행합니다.
   *
   * @param code 코드 내용
   * @param language 언어 정보
   * @return 구조화된 리뷰 결과
   */
  @Override
  public Map<String, Object> review(String code, String language) {
    Map<String, Object> requestBody =
        Map.of(
            "model",
            model,
            "max_tokens",
            MAX_TOKENS,
            "system",
            promptService.getSystemPrompt(),
            "messages",
            List.of(
                Map.of("role", "user", "content", promptService.buildUserPrompt(code, language))));

    try {
      Map<String, Object> response =
          restClientBuilder
              .build()
              .post()
              .uri(apiUrl)
              .header("x-api-key", apiKey)
              .header("anthropic-version", "2023-06-01")
              .header("content-type", "application/json")
              .body(requestBody)
              .retrieve()
              .body(
                  new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() { });

      if (response == null) {
        throw new RuntimeException("Empty response from Claude API");
      }

      Object contentObj = response.get("content");
      if (!(contentObj instanceof List<?>)) {
        throw new RuntimeException("Invalid response format from Claude");
      }

      List<?> contentList = (List<?>) contentObj;
      if (contentList.isEmpty() || !(contentList.get(0) instanceof Map<?, ?>)) {
        throw new RuntimeException("Invalid content format from Claude");
      }

      Map<?, ?> firstContent = (Map<?, ?>) contentList.get(0);
      String text = (String) firstContent.get("text");

      return objectMapper.readValue(
          text, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() { });
    } catch (Exception e) {
      log.error("Claude API error: {}", e.getMessage());
      return Map.of("error", "Claude review failed: " + e.getMessage());
    }
  }
}
