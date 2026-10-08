/** @type {import('next').NextConfig} */
const nextConfig = {
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
