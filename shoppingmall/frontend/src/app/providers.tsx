'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * React Query를 애플리케이션 전역에서 사용할 수 있게 하는 Provider입니다.
 * [이유] 서버 상태 관리 및 자동 캐싱을 통해 불필요한 API 요청을 줄이고,
 * 사용자에게 부드러운 UI 경험(오프라인 대응 등)을 제공하기 위함입니다.
 */
export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분간 데이터를 신선한 상태로 유지
        retry: 1, // 실패 시 1회 재시도
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
