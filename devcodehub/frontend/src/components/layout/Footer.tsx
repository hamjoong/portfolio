import { memo } from 'react';

/**
 * 푸터 컴포넌트 - 정적 콘텐츠이므로 React.memo 적용
 * GEMINI.md 규칙: 성능 최적화 - 불필요한 리렌더링 방지
 */
const Footer: React.FC = memo(() => {
  return (
    <footer className="w-full bg-transparent border-t border-slate-200">
      <div className="h-24 flex items-center justify-center px-12">
        <div className="text-center">
          <p className="m-0 text-slate-600 text-sm font-semibold">
            Copyright(C) 2026. Hjuk. All right reserved.
          </p>
          <p className="m-0 text-slate-500 text-xs leading-relaxed mt-1">
            본 사이트는 비상업적인 용도로 제작된 포트폴리오 사이트입니다.
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
