import React from 'react';
import Header from '@/components/layout/Header';

/**
 * 전역 레이아웃 컴포넌트입니다.
 * [이유] 공통 헤더와 푸터를 배치하고, 모든 페이지의 중앙 정렬 및 패딩을 통일하기 위함입니다.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 PROJECT X Commerce. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
