/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
  // [이유] 개발 환경에서 백엔드 API와의 CORS 이슈를 방지하기 위해 
  // API 요청을 백엔드 서버로 프록시 처리하도록 설정할 수 있습니다.
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
    ];
  },
  // [이유] 정적 이미지 최적화를 위해 외부 도메인 허용이 필요한 경우 이곳에 정의합니다.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'project-x-s3.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
