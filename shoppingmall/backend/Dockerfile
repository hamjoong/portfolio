# 1. Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# 2. Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# IPv4 스택을 우선 사용하도록 설정하여 Supabase 연결 문제를 해결합니다.
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "-Djava.net.preferIPv4Stack=true", "app.jar"]
