package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@Profile("prod")
@Primary
@RequiredArgsConstructor
public class SupabaseNativeStorageService implements FileStorageService {

  private final RestClient.Builder restClientBuilder;

  @Value("${app.storage.bucket}")
  private String bucketName;

  @Value("${SUPABASE_SERVICE_ROLE_KEY}")
  private String serviceRoleKey;

  @Value("${app.upload.base-url}")
  private String baseUrl;

  // Supabase 엔드포인트 호스트에서 프로젝트 ID를 추출한다 (예: <project-id>.storage.supabase.co)
  @Value("${SUPABASE_S3_ENDPOINT_HOST}")
  private String s3Endpoint;

  @Override
  public String uploadProfileImage(MultipartFile file) {
    String extension = ImageUploadValidator.validateAndGetExtension(file);
    try {
      String projectId = s3Endpoint.split("\\.")[0].replace("https://", "");
      String filename = "profiles/" + UUID.randomUUID().toString() + extension;

      // [Why] Supabase Native Storage API의 정확한 엔드포인트 규격은 /storage/v1/object/[bucket]/[path] 입니다.
      String uploadUrl = String.format("https://%s.storage.supabase.co/storage/v1/object/%s/%s",
          projectId, bucketName, filename);

      log.info("Supabase Native Upload Attempt - URL: {}, Filename: {}", uploadUrl, filename);

      restClientBuilder.build()
          .post()
          .uri(uploadUrl)
          .header("Authorization", "Bearer " + serviceRoleKey.trim())
          .contentType(MediaType.parseMediaType(file.getContentType()))
          .body(file.getBytes())
          .retrieve()
          .toBodilessEntity();

      log.info("Supabase Native Upload Success. Filename: {}", filename);

      // [Why] 이미지가 정상 출력되려면 Supabase의 공개(Public) URL 형식을 반환해야 합니다.
      // 형식: https://[project-id].storage.supabase.co/storage/v1/object/public/[bucket]/[path]
      return String.format("https://%s.storage.supabase.co/storage/v1/object/public/%s/%s",
          projectId, bucketName, filename);

    } catch (Exception e) {
      log.error("Supabase Native Upload Failed: {}", e.getMessage(), e);
      throw new BusinessException("파일 업로드 중 오류가 발생했습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }
}
