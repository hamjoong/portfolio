package com.projectx.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * AWS SDK 설정 클래스 (KMS 및 S3 제거됨)
 */
@Configuration
@Profile({"dev", "prod"})
public class AwsConfig {
    // AWS 관련 의존성 제거됨
}
