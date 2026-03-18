package com.projectx.auth.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * AWS SDK 클라이언트 설정 클래스입니다.
 * [성능 최적화] 실제 AWS 인프라가 없는 환경(Render 등)에서도 
 * 초기화 에러 없이 기동되도록 더미 빈 생성을 보장합니다.
 */
@Slf4j
@Configuration
@Profile({"dev", "prod"})
@RequiredArgsConstructor
public class AwsConfig {

    @Value("${aws.region:ap-northeast-2}")
    private String region;

    /**
     * KMS 클라이언트를 생성합니다.
     * [Phase 5] aws.kms.enabled=true 일 때만 빈을 생성하여 비-AWS 환경에서의 오동작을 원천 차단합니다.
     */
    @Bean
    @org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "aws.kms.enabled", havingValue = "true")
    public KmsClient kmsClient() {
        log.info("[AWS] Creating KMS client...");
        return KmsClient.builder()
                .region(Region.of(region))
                .credentialsProvider(software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create())
                .build();
    }

    /**
     * S3 Presigner를 생성합니다.
     * [Phase 5] aws.s3.enabled=true 일 때만 빈을 생성합니다.
     */
    @Bean
    @org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "aws.s3.enabled", havingValue = "true")
    public S3Presigner s3Presigner() {
        log.info("[AWS] Creating S3 Presigner...");
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create())
                .build();
    }
}
