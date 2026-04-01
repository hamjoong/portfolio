#!/bin/bash
# 기존 프로세스 정리
pkill -f 'auth-service' || true
pkill -f 'mvnw' || true
pkill -f 'java' || true

# 백엔드 서버 기동 (상태 로그 기록)
cd "/mnt/d/Program Files/Developer/portfolioproject/portfolio/shoppingmall/backend"
nohup ./mvnw spring-boot:run -Dspring-boot.run.profiles=mock > /home/hjuk/.gemini/tmp/portfolioproject/backend.log 2>&1 &
echo $! > /home/hjuk/.gemini/tmp/portfolioproject/backend.pid
echo "Backend start initiated with PID $(cat /home/hjuk/.gemini/tmp/portfolioproject/backend.pid)"
