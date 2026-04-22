package com.hjuk.devcodehub.domain.user.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@Profile("prod")
@RequiredArgsConstructor
public class S3FileStorageService implements FileStorageService {

  private final ApplicationContext context;

  @Value("${cloud.aws.s3.bucket}")
  private String bucketName;

  @Override
  public String uploadProfileImage(MultipartFile file) {
    AmazonS3 s3Client = context.getBean(AmazonS3.class);
    try {
      String filename =
          "profiles/" + UUID.randomUUID().toString() + getExtension(file.getOriginalFilename());
      ObjectMetadata metadata = new ObjectMetadata();
      metadata.setContentType(file.getContentType());
      metadata.setContentLength(file.getSize());

      s3Client.putObject(
          new PutObjectRequest(bucketName, filename, file.getInputStream(), metadata)
              .withCannedAcl(CannedAccessControlList.PublicRead));

      return s3Client.getUrl(bucketName, filename).toString();
    } catch (IOException e) {
      throw new BusinessException("파일 업로드 중 오류가 발생했습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  private String getExtension(String filename) {
    return (filename != null && filename.contains("."))
        ? filename.substring(filename.lastIndexOf("."))
        : "";
  }
}
