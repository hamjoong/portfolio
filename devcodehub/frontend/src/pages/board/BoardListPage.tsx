import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { normalizeTag } from '../../utils/tagUtils';
import BoardCard from '../../components/board/BoardCard';

interface Board {
  id: number;
  title: string;
  authorNickname: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  tags: string[];
}

const BoardListPage: React.FC<{ type: 'SKILL' | 'AI' }> = ({ type }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMember, isLoggedIn } = useAuthGuard();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 페이지네이션 상태
  const [totalPages, setTotalPages] = useState(0);
  const [searchInputValue, setSearchInputValue] = useState(searchParams.get('keyword') || '');

  const tagFilter = searchParams.get('tag');
  const keywordFilter = searchParams.get('keyword');
  const currentPage = parseInt(searchParams.get('page') || '0');

  const handleBookmarkToggle = useCallback((postId: number, newBookmarkedStatus: boolean) => {
    setBoards(currentBoards =>
      currentBoards.map(board =>
        board.id === postId ? { ...board, isBookmarked: newBookmarkedStatus } : board
      )
    );
  }, []);

  useEffect(() => {
    setSearchInputValue(searchParams.get('keyword') || '');
  }, [searchParams]);

  useEffect(() => {
    /** [Why] 페이지 진입, 검색 조건 변경, 로그인 상태 변화 시 항상 최신 목록을 가져오도록 설계함. */
    const fetchBoards = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('type', type);
        queryParams.append('page', currentPage.toString());
        queryParams.append('size', '10');
        queryParams.append('sort', 'createdAt,desc');

        if (tagFilter && tagFilter !== '전체') queryParams.append('tag', tagFilter);
        if (keywordFilter) queryParams.append('keyword', keywordFilter);

        const fetchUrl = `/boards?${queryParams.toString()}`;
        const response = await api.get(fetchUrl);
        
        if (response.data && response.data.content) {
          setBoards(response.data.content);
          setTotalPages(response.data.totalPages);
        } else {
          setBoards([]);
          setTotalPages(0);
        }
      } catch (error: unknown) {
        console.error('Failed to fetch boards:', error);
        setBoards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, [type, tagFilter, keywordFilter, currentPage, isLoggedIn]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    navigate(`/boards/${type.toLowerCase()}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInputValue.trim()) {
      params.set('keyword', searchInputValue.trim());
    } else {
      params.delete('keyword');
    }
    params.set('page', '0');
    navigate(`/boards/${type.toLowerCase()}?${params.toString()}`);
  };

  const tags = type === 'SKILL' 
    ? ['전체', '프론트엔드', '백엔드', '풀스택', 'DB', '데브옵스'] 
    : ['전체', 'Chat GPT', 'Gemini', 'Claude', 'LLM', 'VS Code', 'Antigravity', 'Cursor'];

  return (
    <div className="w-full max-w-5xl mx-auto pb-20">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-slate-900">{type === 'SKILL' ? 'IT 스킬 게시판' : 'AI 정보 게시판'}</h1>
        <div className="flex gap-4 items-center">
          <form onSubmit={handleSearch} className="flex items-center bg-white border-2 border-slate-200 rounded-2xl p-1">
            <input 
              type="text" 
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder="제목 또는 내용 검색" 
              className="border-none py-2.5 px-3.5 text-sm outline-none w-64 font-medium" 
            />
            <button type="submit" className="bg-none border-none cursor-pointer text-lg">🔍</button>
          </form>
          {isMember && (
            <button 
              onClick={() => navigate(`/boards/new?type=${type}`)} 
              className="px-6 py-3.5 bg-blue-600 text-white border-none rounded-2xl font-black cursor-pointer"
            >
              글쓰기
            </button>
          )}
        </div>
      </header>

      <div className="flex gap-3.5 mb-10 flex-wrap">
        {tags.map(tag => (
          <button 
            key={tag} 
            onClick={() => {
                const params = new URLSearchParams(searchParams);
                const normalizedTag = tag === '전체' ? '전체' : normalizeTag(tag);
                if (normalizedTag === '전체') params.delete('tag');
                else params.set('tag', normalizedTag);
                params.set('page', '0');
                navigate(`/boards/${type.toLowerCase()}?${params.toString()}`);
            }}
            className={`px-4 py-2.5 rounded-full font-semibold cursor-pointer border-2 transition-colors ${
              (tag === '전체' && !tagFilter) || (tag !== '전체' && normalizeTag(tag) === tagFilter) 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-12">로딩 중...</div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {keywordFilter ? `'${keywordFilter}'에 대한 검색 결과가 없습니다.` : '게시글이 없습니다.'}
          </div>
        ) : (
          <>
            {boards.map(board => (
              <BoardCard 
                key={board.id} 
                board={board} 
                onBookmarkToggle={handleBookmarkToggle} 
              />
            ))}

            <div className="flex justify-center items-center gap-2 mt-12">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                이전
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
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
                onClick={() => handlePageChange(currentPage + 1)}
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

export default BoardListPage;
