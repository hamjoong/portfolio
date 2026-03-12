import axios from 'axios';

/**
 * 모바일 앱용 API 클라이언트 설정입니다.
 * [이유] 모바일 환경(Android/iOS)에서 백엔드 서버와 통신할 때
 * 일관된 타임아웃과 보안 헤더(JWT)를 관리하기 위함입니다.
 */
const client = axios.create({
  // [참고] 로컬 개발 시에는 PC의 IP 주소를 사용해야 에뮬레이터에서 접근 가능합니다.
  baseURL: 'http://10.0.2.2:8080/api/v1',
  timeout: 10000,
});

export default client;
