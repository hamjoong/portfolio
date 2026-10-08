import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import BoardCard from '../../components/board/BoardCard';

// Define the structure for Board data, including bookmark and like status
interface Board {
  id: number;
  title: string;
  authorNickname: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean; // This will always be true for this page
  createdAt: string;
  tags: string[];
}

const MyBookmarksPage: React.FC = () => {
  const { isLoggedIn, role } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const isFetching = useRef(false);

  const handleBookmarkToggle = useCallback((postId: number, newBookmarkedStatus: boolean) => {
    if (!newBookmarkedStatus) {
      setBookmarks(current => current.filter(b => b.id !== postId));
    }
  }, []);
  
  const fetchBookmarks = useCallback(async (page: number) => {
    if (isFetching.current) return;
    isFetching.current = true;
    
    setLoading(true);
    try {
      const response = await api.get(`/boards/me/bookmarks?page=${page}&size=10&sort=createdAt,desc`);
      if (response.data && response.data.content) {
        setBookmarks(response.data.content);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && role !== 'GUEST') {
      fetchBookmarks(0);
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, role, fetchBookmarks]);

  // [Why] 비회원인 경우 접근 제한 안내 UI를 렌더링함.
  if (!isLoggedIn || role === 'GUEST') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 font-bold text-lg">로그인이 필요한 서비스입니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-black text-slate-900 mb-8">북마크한 글</h1>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-12">로딩 중...</div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            아직 북마크한 글이 없습니다. 관심 있는 글을 북마크해보세요!
          </div>
        ) : (
          <>
            {bookmarks.map(board => (
              <BoardCard 
                key={board.id} 
                board={board} 
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}

            <div className="flex justify-center items-center gap-2 mt-12">
              <button 
                onClick={() => fetchBookmarks(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                이전
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchBookmarks(i)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    currentPage === i 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => fetchBookmarks(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookmarksPage;
