/** @type {import('next').NextConfig} */
const nextConfig = {
  // [이유] Next.js 15의 핵심 성능 최적화 기능인 PPR을 활성화합니다.
  // 현재 버전에서 Canary 전용이므로 안정화를 위해 일시 비활성화합니다.
  /*
  experimental: {
    ppr: 'incremental',
  },
  */
  /*
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
    ];
  },
  */
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
