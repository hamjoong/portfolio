package com.hjuk.devcodehub.global.config;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.Protocol;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class S3Config {

  private final Environment env;

  @Bean
  @ConditionalOnProperty(
      name = {"SUPABASE_ACCESS_KEY", "SUPABASE_SECRET_KEY"})
  public AmazonS3 amazonS3() {
    String region = env.getProperty("cloud.aws.region.static", "ap-northeast-2");
    String accessKey = env.getProperty("SUPABASE_ACCESS_KEY");
    String secretKey = env.getProperty("SUPABASE_SECRET_KEY");
    String endpoint = env.getProperty("SUPABASE_S3_ENDPOINT_HOST");

    log.info("S3Config: Initializing AmazonS3 Client with endpoint: {}", endpoint);

    ClientConfiguration clientConfig = new ClientConfiguration();
    clientConfig.setProtocol(Protocol.HTTPS);

    var builder = AmazonS3ClientBuilder.standard()
        .withCredentials(new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKey, secretKey)))
        .withClientConfiguration(clientConfig)
        .withRegion(region);

    if (endpoint != null && !endpoint.isEmpty()) {
      builder.withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpoint, region));
    }

    return builder.build();
  }
}
