package com.hjuk.devcodehub.domain.board.service;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * [Why] - IT 기술 및 AI 관련 키워드의 동의어 처리와 검색어 확장을 담당함. - BoardService의 책임을 분리하여 클래스 크기를 줄이고 유지보수성을 높임
 * (TRD SRP 준수).
 */
@Service
public class BoardKeywordService {

  private static class KeywordRule {
    private final String normalized;
    private final List<String> containsPatterns;
    private final List<String> equalsPatterns;

    KeywordRule(String inputNormalized, List<String> contains, List<String> equals) {
      this.normalized = inputNormalized;
      this.containsPatterns = contains;
      this.equalsPatterns = equals;
    }

    public boolean matches(String k) {
      for (String pattern : containsPatterns) {
        if (k.contains(pattern)) {
          return true;
        }
      }
      for (String pattern : equalsPatterns) {
        if (k.equals(pattern)) {
          return true;
        }
      }
      return false;
    }

    public String getNormalized() {
      return normalized;
    }
  }

  private static final List<KeywordRule> SYNONYM_RULES =
      Arrays.asList(
          new KeywordRule(
              "FRONTEND",
              Arrays.asList(
                  "프론트엔드", "FRONTEND", "FRONT END", "frontend", "front end", "프론트", "FE", "fe"),
              Arrays.asList("FE")),
          new KeywordRule(
              "BACKEND",
              Arrays.asList("백엔드", "BACKEND", "BACK END", "backend", "back end", "BE", "be"),
              Arrays.asList("BE")),
          new KeywordRule(
              "FULLSTACK",
              Arrays.asList(
                  "풀스택",
                  "FULLSTACK",
                  "FULL STACK",
                  "FULL-STACK",
                  "fullstack",
                  "full stack",
                  "FullStack",
                  "full-stack",
                  "FS",
                  "fs"),
              Arrays.asList("FS")),
          new KeywordRule(
              "DB",
              Arrays.asList(
                  "데이터베이스",
                  "DATABASE",
                  "DATA BASE",
                  "디비",
                  "database",
                  "data base",
                  "DataBse",
                  "DB",
                  "db"),
              Arrays.asList("DB")),
          new KeywordRule(
              "JAVASCRIPT",
              Arrays.asList(
                  "자바스크립트",
                  "JAVASCRIPT",
                  "JAVA SCRIPT",
                  "자스",
                  "javascript",
                  "java script",
                  "JavaScript",
                  "JS",
                  "js"),
              Arrays.asList("JS")),
          new KeywordRule("JAVA", Arrays.asList("자바", "JAVA", "java"), List.of()),
          new KeywordRule("JSON", Arrays.asList("제이슨", "JSON", "json"), List.of()),
          new KeywordRule(
              "NODEJS",
              Arrays.asList("노드제이에스", "NODEJS", "NODE JS", "nodejs", "node js", "노드"),
              List.of()),
          new KeywordRule(
              "REACT", Arrays.asList("리액트", "리엑트", "REACT", "react", "React"), List.of()),
          new KeywordRule(
              "SPRINGBOOT",
              Arrays.asList(
                  "스프링부트", "SPRINGBOOT", "SPRING BOOT", "springboot", "spring boot", "스프링"),
              List.of()),
          new KeywordRule(
              "TYPESCRIPT",
              Arrays.asList(
                  "타입스크립트",
                  "TYPESCRIPT",
                  "TYPE SCRIPT",
                  "typescript",
                  "type script",
                  "TypeScript",
                  "TS",
                  "ts",
                  "타스",
                  "타입스"),
              Arrays.asList("TS")),
          new KeywordRule(
              "CHATGPT",
              Arrays.asList(
                  "챗지피티",
                  "CHATGPT",
                  "CHAT GPT",
                  "chatgpt",
                  "chat gpt",
                  "Chat GPT",
                  "Chat gpt",
                  "지피티"),
              Arrays.asList("GPT")),
          new KeywordRule(
              "GEMINI",
              Arrays.asList("제미나이", "GEMINI", "gemini", "Gemini", "GEM", "gem", "제미니"),
              List.of()),
          new KeywordRule(
              "CLAUDE",
              Arrays.asList(
                  "클로드",
                  "CLAUDE",
                  "claude",
                  "Claude",
                  "엔트로픽",
                  "ANTHROPIC",
                  "anthropic",
                  "Anthropic"),
              List.of()),
          new KeywordRule(
              "VSCODE",
              Arrays.asList("VS CODE", "VSCODE", "vs code", "vscode", "브이에스코드"),
              List.of()),
          new KeywordRule("AI", Arrays.asList("AI", "ai", "에이아이", "인공지능"), List.of()),
          new KeywordRule(
              "AIAGENT",
              Arrays.asList("에이아이에이전트", "AIAGENT", "AI AGENT", "aiagent", "ai agent", "에이전트"),
              Arrays.asList("AG")),
          new KeywordRule(
              "DEVOPS",
              Arrays.asList("데브옵스", "DEVOPS", "DEV OPS", "devops", "dev ops", "DevOps", "dev-ops"),
              List.of()));

  public Set<String> extractExpandedKeywords(String keyword) {
    if (keyword == null || keyword.isBlank()) {
      return Set.of();
    }

    return Arrays.stream(keyword.split("\\s+"))
        .filter(k -> !k.isBlank())
        .flatMap(
            k -> {
              String expanded = expandKeyword(k);
              if (expanded.equalsIgnoreCase(k)) {
                return Arrays.stream(new String[] {k});
              } else {
                return Arrays.stream(new String[] {k, expanded});
              }
            })
        .collect(Collectors.toSet());
  }

  private String expandKeyword(String keyword) {
    String k = keyword.trim().toUpperCase();
    for (KeywordRule rule : SYNONYM_RULES) {
      if (rule.matches(k)) {
        return rule.getNormalized();
      }
    }
    return keyword;
  }
}
