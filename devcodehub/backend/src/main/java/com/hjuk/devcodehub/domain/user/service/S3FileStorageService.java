package com.hjuk.devcodehub.domain.user.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.io.IOException;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@Profile("prod")
public class S3FileStorageService implements FileStorageService {

  private final AmazonS3 s3Client;

  @Value("${cloud.aws.s3.bucket}")
  private String bucketName;

  @Autowired
  public S3FileStorageService(@Autowired(required = false) AmazonS3 s3Client) {
    this.s3Client = s3Client;
  }

  @Override
  public String uploadProfileImage(MultipartFile file) {
    if (s3Client == null) {
      log.error("AmazonS3 client is not initialized. Check if required environment variables are set.");
      throw new BusinessException("스토리지 서비스가 구성되지 않았습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
    }

    try {
      String filename =
          "profiles/" + UUID.randomUUID().toString() + getExtension(file.getOriginalFilename());
      ObjectMetadata metadata = new ObjectMetadata();
      metadata.setContentType(file.getContentType());
      metadata.setContentLength(file.getSize());

      log.info("Starting file upload to S3: bucket={}, filename={}", bucketName, filename);

      s3Client.putObject(new PutObjectRequest(bucketName, filename, file.getInputStream(), metadata));

      String fileUrl = s3Client.getUrl(bucketName, filename).toString();
      log.info("File upload successful: url={}", fileUrl);
      return fileUrl;
    } catch (IOException e) {
      log.error("File upload failed due to IO error: {}", e.getMessage(), e);
      throw new BusinessException("파일 업로드 중 오류가 발생했습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      log.error("S3 upload failed: {}", e.getMessage(), e);
      throw new BusinessException("스토리지 업로드 중 기술적인 오류가 발생했습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  private String getExtension(String filename) {
    return (filename != null && filename.contains("."))
        ? filename.substring(filename.lastIndexOf("."))
        : "";
  }
}
