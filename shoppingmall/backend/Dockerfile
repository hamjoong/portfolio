# 1. Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests -Dmaven.test.skip=true

# 2. Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# JVM 메모리 최적화 및 난수 생성 속도 개선을 통해 Render 무료 티어의 타임아웃 문제를 해결합니다.
ENTRYPOINT ["java", "-Xms256m", "-Xmx384m", "-Djava.security.egd=file:/dev/./urandom", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
