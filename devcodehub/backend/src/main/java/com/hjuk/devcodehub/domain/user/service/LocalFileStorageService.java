package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@Profile("local")
@Primary
public class LocalFileStorageService implements FileStorageService {
  @Value("${app.upload.profile-dir}")
  private String profileDir;

  @Value("${app.upload.base-url}")
  private String baseUrl;

  @Override
  public String uploadProfileImage(MultipartFile file) {
    log.info("파일 업로드 시작: originalName={}", file.getOriginalFilename());
    try {
      // 프로젝트 루트 기준 절대 경로 보장
      Path root = Paths.get(profileDir).toAbsolutePath().normalize();
      log.info("저장 대상 디렉토리: {}", root);

      if (!Files.exists(root)) {
        Files.createDirectories(root);
        log.info("디렉토리 생성 완료: {}", root);
      }

      String filename = UUID.randomUUID().toString() + getExtension(file.getOriginalFilename());
      Path targetPath = root.resolve(filename);
      Files.copy(file.getInputStream(), targetPath);

      log.info("파일 저장 성공: {}", targetPath);
      return baseUrl.replaceAll("/$", "") + "/uploads/profiles/" + filename;
    } catch (IOException e) {
      log.error("파일 업로드 IO 예외 발생: ", e);
      throw new BusinessException("파일 업로드 중 오류 발생: " + e.getMessage(), ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  private String getExtension(String f) {
    return (f != null && f.contains(".")) ? f.substring(f.lastIndexOf(".")) : "";
  }
}
