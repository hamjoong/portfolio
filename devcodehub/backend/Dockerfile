# 1. 빌드 단계
FROM docker.io/library/maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# 2. 실행 단계
FROM docker.io/library/eclipse-temurin:21-jre-jammy
WORKDIR /app

# [Why] 애플리케이션 기동 시 환경 변수를 로드할 수 있도록 .env 파일들을 복사합니다.
COPY --from=build /app/.env* ./
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]