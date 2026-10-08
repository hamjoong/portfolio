# 1. 빌드 단계
FROM docker.io/library/maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# 2. 실행 단계
FROM docker.io/library/eclipse-temurin:21-jre-jammy
WORKDIR /app

# [Why] 비밀값(.env)을 이미지에 넣지 않는다. 설정은 실행 시 환경변수로 주입한다.
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# [Why] 무료 호스팅(512MB)에서 JVM이 컨테이너 한도를 넘지 않도록 힙·메타스페이스·코드캐시를 제한한다.
# 512MB 컨테이너 실측: 기본 설정 389MiB → 이 설정 286MiB (유휴, 헬스 30회 호출 후)
ENTRYPOINT ["java", "-Xmx256m", "-Xss512k", "-XX:+UseSerialGC", "-XX:MaxMetaspaceSize=128m", "-XX:ReservedCodeCacheSize=64m", "-XX:TieredStopAtLevel=1", "-jar", "app.jar"]