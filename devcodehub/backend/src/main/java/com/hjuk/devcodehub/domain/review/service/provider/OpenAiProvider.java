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

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAiProvider implements AiProvider {

  private final RestClient.Builder restClientBuilder;
  private final PromptEngineeringService promptService;
  private final ObjectMapper objectMapper;

  @Value("${app.ai.openai.api-key}")
  private String apiKey;

  @Value("${app.ai.openai.model:gpt-4o-mini}")
  private String model;

  @Override
  public String getName() {
    return "openai";
  }

  @Override
  public Map<String, Object> review(String code, String language) {
    String url = "https://api.openai.com/v1/chat/completions";

    Map<String, Object> requestBody =
        Map.of(
            "model", model,
            "messages",
                List.of(
                    Map.of("role", "system", "content", promptService.getSystemPrompt()),
                    Map.of(
                        "role", "user", "content", promptService.buildUserPrompt(code, language))),
            "response_format", Map.of("type", "json_object"));

    try {
      Map<String, Object> response =
          restClientBuilder
              .build()
              .post()
              .uri(url)
              .header("Authorization", "Bearer " + apiKey)
              .body(requestBody)
              .retrieve()
              .body(Map.class);

      List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
      Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
      String content = (String) message.get("content");

      return objectMapper.readValue(content, Map.class);
    } catch (Exception e) {
      log.error("OpenAI API error: {}", e.getMessage());
      return Map.of("error", "OpenAI review failed: " + e.getMessage());
    }
  }
}
