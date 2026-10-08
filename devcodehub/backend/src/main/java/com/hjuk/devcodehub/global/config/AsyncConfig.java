package com.hjuk.devcodehub.global.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * [Why] - 비동기 작업 처리를 위한 전역 설정 클래스입니다. - AI 리뷰 서비스와 같이 외부 API 호출(I/O Intensive)이 많은 작업을 위해 별도의 스레드
 * 풀을 구성하여 시스템의 기본 스레드 자원(Common ForkJoinPool) 고갈을 방지하고 성능을 최적화합니다.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

  private static final int AI_CORE_POOL_SIZE = 20;
  private static final int AI_MAX_POOL_SIZE = 50;
  private static final int AI_QUEUE_CAPACITY = 200;

  @Bean(name = "aiTaskExecutor")
  public Executor aiTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(AI_CORE_POOL_SIZE);
    executor.setMaxPoolSize(AI_MAX_POOL_SIZE);
    executor.setQueueCapacity(AI_QUEUE_CAPACITY);
    executor.setThreadNamePrefix("AI-Review-");
    executor.setRejectedExecutionHandler(
        new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
    executor.initialize();
    return executor;
  }
}
