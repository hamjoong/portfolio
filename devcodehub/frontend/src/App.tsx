import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/error-boundary/ErrorBoundary'
import { useAuthStore } from './store/authStore'
import { stompClient } from './services/stompClient'

/**
 * 코드 스플리팅으로 초기 번들 크기를 줄여 Lazy Loading을 적용합니다.
 * GEMINI.md 규칙: Lazy Loading 적용, 성능 최적화
 */
const Home = lazy(() => import('./pages/home/Home'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const LoginCallback = lazy(() => import('./pages/auth/LoginCallback'));
const FindIdPage = lazy(() => import('./pages/auth/FindIdPage'));
const FindPwPage = lazy(() => import('./pages/auth/FindPwPage'));
const AiReviewPage = lazy(() => import('./pages/review/AiReviewPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const CreditPage = lazy(() => import('./pages/credits/CreditPage'));
const BoardListPage = lazy(() => import('./pages/board/BoardListPage'));
const BoardDetailPage = lazy(() => import('./pages/board/BoardDetailPage'));
const BoardWritePage = lazy(() => import('./pages/board/BoardWritePage'));
const MyBookmarksPage = lazy(() => import('./pages/board/MyBookmarksPage'));
const ChatPage = lazy(() => import('./pages/chat/ChatPage'));
const SeniorReviewListPage = lazy(() => import('./pages/review/SeniorReviewListPage'));
const SeniorReviewWritePage = lazy(() => import('./pages/review/SeniorReviewWritePage'));
const SeniorReviewDetailPage = lazy(() => import('./pages/review/SeniorReviewDetailPage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

/** 페이지 로딩 중 표시할 Fallback UI */
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <p className="text-slate-400 text-lg font-medium">페이지 로딩 중...</p>
  </div>
);

function App() {
  const { isLoggedIn, accessToken } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn && accessToken) {
      stompClient.connect(accessToken);
    } else {
      stompClient.disconnect();
    }
  }, [isLoggedIn, accessToken]);

  return (
    <Router>
      <Layout>
        <ErrorBoundary> {/* Wrap Routes with ErrorBoundary */}
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/callback" element={<LoginCallback />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/find-id" element={<FindIdPage />} />
              <Route path="/find-pw" element={<FindPwPage />} />
              <Route path="/ai-review" element={<AiReviewPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/credits" element={<CreditPage />} />

              {/* 게시판 라우트 - /boards/new와 /boards/me/bookmarks가 :id보다 먼저 매칭되어야 합니다 */}
              <Route path="/boards/skill" element={<BoardListPage type="SKILL" />} />
              <Route path="/boards/ai" element={<BoardListPage type="AI" />} />
              <Route path="/boards/new" element={<BoardWritePage />} />
              <Route path="/boards/me/bookmarks" element={<MyBookmarksPage />} />
              <Route path="/boards/:id" element={<BoardDetailPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/senior-review" element={<SeniorReviewListPage />} />
              <Route path="/senior-review/new" element={<SeniorReviewWritePage />} />
              <Route path="/senior-review/:id" element={<SeniorReviewDetailPage />} />
              <Route path="/admin" element={<AdminPage />} />

              {/* 404 처리 */}
              <Route path="*" element={<div className="text-center mt-20 text-slate-500 text-lg">페이지를 찾을 수 없습니다.</div>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </Router>
  );
}

export default App;
