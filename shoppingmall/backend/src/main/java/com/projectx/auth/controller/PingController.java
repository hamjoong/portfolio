package com.projectx.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Render 배포 환경에서 서버가 절전 모드로 전환되는 것을 방지하기 위한 상태 체크 컨트롤러입니다.
 * [이유] Render의 무료 티어는 15분간 요청이 없으면 서버를 종료시킵니다. 
 * 외부 핑 서비스(Cron-job.org 등)가 이 엔드포인트를 주기적으로 호출하여 서버를 활성 상태로 유지합니다.
 */
@RestController
@RequestMapping("/api/v1")
public class PingController {

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
