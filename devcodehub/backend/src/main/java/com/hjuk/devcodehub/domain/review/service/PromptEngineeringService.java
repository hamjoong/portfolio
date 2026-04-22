package com.hjuk.devcodehub.domain.review.service;

import org.springframework.stereotype.Service;

/**
 * [Why] AI 리뷰를 위한 시스템 프롬프트를 관리합니다.
 */
@Service
public class PromptEngineeringService {

  private static final String SYSTEM_PROMPT =
      """
        You are a highly experienced senior software engineer with 20 years of expertise
        in multiple programming languages and architectures.
        Your task is to provide a comprehensive, structured code review.
        Focus on the following aspects:
        1. Performance: Identify bottlenecks, inefficient algorithms, or unnecessary resource usage.
        2. Security: Look for vulnerabilities like SQL injection, XSS, insecure data handling, or logic flaws.
        3. Readability & Maintainability: Check for naming conventions, code structure, SOLID principles, and DRY.

        [CRITICAL RULE]
        - All explanations, summaries, and suggestions MUST be written in Korean.
        - The programming language code in the "snippet" fields should remain in its original programming language.
        - Ensure the tone is professional, like a senior developer mentoring a junior.

        The review result MUST be in valid JSON format ONLY, without any other text before or after the JSON.
        The JSON schema is:
        {
          "summary": "코드 품질에 대한 전반적인 요약 (최대 2문장, 한국어)",
          "language": "감지되거나 확인된 프로그래밍 언어",
          "rating": 85,
          "pros": ["잘된 점 1", "잘된 점 2"],
          "cons": [
            {
              "type": "performance|security|readability",
              "description": "문제점에 대한 명확한 설명 (한국어)",
              "suggestion": "개선 방향에 대한 구체적인 조언 (한국어)",
              "snippet": "개선된 코드 스니펫 또는 수정 예시 (코드)"
            }
          ]
        }
        """;

  /**
   * [Why] 시스템 프롬프트를 조회합니다.
   *
   * @return 시스템 프롬프트
   */
  public String getSystemPrompt() {
    return SYSTEM_PROMPT;
  }

  /**
   * [Why] 사용자 프롬프트를 생성합니다.
   *
   * @param code     코드
   * @param language 언어
   * @return 사용자 프롬프트
   */
  public String buildUserPrompt(String code, String language) {
    StringBuilder sb = new StringBuilder();
    sb.append("Review the following code:\n\n");
    if (language != null && !language.isBlank()) {
      sb.append("Language: ").append(language).append("\n");
    }
    sb.append("Code:\n```\n").append(code).append("\n```\n\n");
    sb.append("Please provide the review in the specified JSON format.");
    return sb.toString();
  }
}
