package com.hjuk.devcodehub;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.support.ResourceBundleMessageSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@EnableCaching
@org.springframework.scheduling.annotation.EnableScheduling
@org.springframework.scheduling.annotation.EnableAsync
@SpringBootApplication
public class DevCodeHubApplication {

  private static final Logger LOG = LoggerFactory.getLogger(DevCodeHubApplication.class);

  @jakarta.annotation.PostConstruct
  public void init() {
    // [Why] 운영 서버(AWS)의 기본 타임존을 한국 시간(KST)으로 고정하여 로그 및 DB 시간을 일치시킵니다.
    java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Seoul"));
  }

  public static void main(String[] args) {
    // 1. 기본 .env 로드
    loadDotenv(".env");

    // 2. 활성 프로필 확인 (시스템 프로퍼티 또는 환경 변수)
    String profiles = System.getProperty("spring.profiles.active");
    if (profiles == null || profiles.isEmpty()) {
      profiles = System.getenv("SPRING_PROFILES_ACTIVE");
    }

    if (profiles != null && !profiles.isEmpty()) {
      for (String profile : profiles.split(",")) {
        String p = profile.trim();
        loadDotenv(".env." + p);
        // [Why] 'prod' 프로필인 경우 관례상 '.env.production' 파일을 사용하는 경우가 많으므로 추가 체크합니다.
        if ("prod".equals(p)) {
          loadDotenv(".env.production");
        }
      }
    }

    LOG.info(">>> Active Profiles: {}", (profiles != null ? profiles : "default"));
    SpringApplication.run(DevCodeHubApplication.class, args);
  }

  private static void loadDotenv(String filename) {
    Dotenv dotenv = Dotenv.configure()
        .directory("./")
        .filename(filename)
        .ignoreIfMalformed()
        .ignoreIfMissing()
        .load();

    for (DotenvEntry entry : dotenv.entries()) {
      System.setProperty(entry.getKey(), entry.getValue());
      LOG.debug("Loaded property from {}: {}", filename, entry.getKey());
    }
  }

  @Bean
  public MessageSource messageSource() {
    ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
    messageSource.setBasenames("messages"); // messages.properties 파일을 기본으로 사용
    messageSource.setDefaultEncoding("UTF-8"); // 인코딩 설정
    return messageSource;
  }
}
