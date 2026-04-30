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

  @Value("${cloud.aws.s3.bucket}")
  private String bucketName;

  @Value("${SUPABASE_SERVICE_ROLE_KEY}")
  private String serviceRoleKey;

  @Value("${app.upload.base-url}")
  private String baseUrl;

  // S3 엔드포인트로부터 프로젝트 ID 추출 (예: nmllqnjmuzqgesadcqov)
  @Value("${SUPABASE_S3_ENDPOINT_HOST}")
  private String s3Endpoint;

  @Override
  public String uploadProfileImage(MultipartFile file) {
    try {
      String projectId = s3Endpoint.split("\\.")[0].replace("https://", "");
      String filename = "profiles/" + UUID.randomUUID().toString() + getExtension(file.getOriginalFilename());

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
      throw new BusinessException("파일 스토리지 연동 실패: " + e.getMessage(), ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  private String getExtension(String filename) {
    return (filename != null && filename.contains(".")) ? filename.substring(filename.lastIndexOf(".")) : "";
  }
}
