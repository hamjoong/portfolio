package com.hjuk.devcodehub.global.config;

import java.time.Duration;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

  private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
  private static final Duration READ_TIMEOUT = Duration.ofSeconds(60);

  /**
   * [Why] 외부 API(AI·PortOne·Supabase)가 응답하지 않을 때 스레드가 무한정 매달리지 않도록 연결 5초, 읽기 60초 타임아웃을 건다.
   *
   * @return 타임아웃이 설정된 RestClient 빌더
   */
  @Bean
  public RestClient.Builder restClientBuilder() {
    ClientHttpRequestFactorySettings settings =
        ClientHttpRequestFactorySettings.defaults()
            .withConnectTimeout(CONNECT_TIMEOUT)
            .withReadTimeout(READ_TIMEOUT);
    return RestClient.builder().requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings));
  }
}
