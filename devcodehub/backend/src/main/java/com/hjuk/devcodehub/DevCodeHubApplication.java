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

  public static void main(String[] args) {
    // [Why] SECURITY.md 규칙 준수: 민감한 API Key 노출 방지를 위해 .env 파일을 로드하여 시스템 환경 변수로 설정함.
    Dotenv dotenv = Dotenv.configure().directory("./").ignoreIfMalformed().ignoreIfMissing().load();

    for (DotenvEntry entry : dotenv.entries()) {
      System.setProperty(entry.getKey(), entry.getValue());
      LOG.debug("Loaded property: {}", entry.getKey());
    }

    String profiles = System.getProperty("spring.profiles.active");
    LOG.info(">>> Active Profiles: {}", (profiles != null ? profiles : "default"));

    SpringApplication.run(DevCodeHubApplication.class, args);
  }

  @Bean
  public MessageSource messageSource() {
    ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
    messageSource.setBasenames("messages"); // messages.properties 파일을 기본으로 사용
    messageSource.setDefaultEncoding("UTF-8"); // 인코딩 설정
    return messageSource;
  }
}
