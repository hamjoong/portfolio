package com.hjuk.devcodehub.global.testsupport;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/** [Why] 동시성 테스트마다 같은 스레드 시작·결과 수집 코드를 반복하지 않도록 모아 둔다. */
public final class ConcurrencyRunner {

  private ConcurrencyRunner() {
    // 유틸리티 클래스
  }

  /** 모든 작업을 같은 시점에 시작시키고, 작업마다 성공이면 null, 실패면 예외를 모아 돌려준다. */
  public static List<Throwable> runConcurrently(int count, Callable<Void> task) throws Exception {
    ExecutorService pool = Executors.newFixedThreadPool(count);
    CountDownLatch ready = new CountDownLatch(count);
    CountDownLatch start = new CountDownLatch(1);
    List<Future<Throwable>> futures = new ArrayList<>();
    for (int i = 0; i < count; i++) {
      futures.add(
          pool.submit(
              () -> {
                ready.countDown();
                start.await();
                try {
                  task.call();
                  return null;
                } catch (Throwable t) {
                  return t;
                }
              }));
    }
    ready.await();
    start.countDown();
    List<Throwable> results = new ArrayList<>();
    for (Future<Throwable> future : futures) {
      results.add(future.get());
    }
    pool.shutdown();
    return results;
  }
}
