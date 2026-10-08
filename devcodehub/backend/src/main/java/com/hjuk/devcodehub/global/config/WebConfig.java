package com.hjuk.devcodehub.global.config;

import java.io.File;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * [Why] 정적 리소스(업로드된 프로필 이미지 등) 매핑 및 웹 설정을 관리합니다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Value("${app.upload.profile-dir}")
  private String profileDir;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // 1. 프로필 이미지 업로드 경로 매핑 (기존 기능 복구)
    String absolutePath = new File(profileDir).getAbsolutePath();
    if (!absolutePath.endsWith(File.separator)) {
      absolutePath += File.separator;
    }
    registry
        .addResourceHandler("/uploads/profiles/**")
        .addResourceLocations("file:" + absolutePath);
  }
}
