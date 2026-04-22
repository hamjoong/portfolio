import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import axios from 'axios';

interface Board {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  authorLoginId: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  tags: string[];
  type?: string;
}

interface Comment {
  id: number;
  content: string;
  authorNickname: string;
  authorLoginId: string;
  createdAt: string;
}

const BoardDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loginId: currentLoginId, role } = useAuthStore();
  const { requireMember, isMember } = useAuthGuard();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  
  /** [Why] 조회수 중복 증가(+2)를 방지하기 위해 useRef를 사용하여 한 번만 API를 호출하도록 제어함. */
  const viewIncremented = useRef(false);

  // 댓글 수정 관련 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const fetchComments = useCallback(async () => {
    if (isDeleting) return;
    try {
      const commentRes = await api.get(`/boards/${id}/comments`);
      setComments(commentRes.data);
    } catch (error) {
      if (!isDeleting) {
        console.error('Failed to fetch comments:', error);
      }
    }
  }, [id, isDeleting]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isDeleting) return;
      setLoading(true);
      try {
        const boardRes = await api.get(`/boards/${id}`);
        if (isMounted) {
          setBoard(boardRes.data);
          
          /** [Why] 조회수 +1 설계를 위해 상세 로드 성공 시에만 명시적으로 증가 API를 호출함. */
          if (!viewIncremented.current) {
            viewIncremented.current = true;
            api.post(`/boards/${id}/views`).catch(() => {});
          }

          await fetchComments();
        }
      } catch (error: unknown) {
        if (!isDeleting && isMounted) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            alert('이미 삭제되었거나 존재하지 않는 게시글입니다.');
            setIsNotFound(true);
          } else if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error?.message || '게시글 정보를 불러오는 중 오류가 발생했습니다.';
            alert(errorMessage);
            console.error('Failed to fetch data:', error);
          } else {
            alert('게시글 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.');
            console.error('Failed to fetch data:', error);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, isDeleting, fetchComments]);

  const handleEdit = () => {
    navigate(`/boards/new?edit=true&id=${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    /** [Why] 삭제 요청 즉시 isDeleting을 활성화하여 useEffect 등의 부수적인 API 호출 및 알럿 발생을 차단함. */
    setIsDeleting(true);
    try {
      const boardType = board?.type?.toLowerCase() || 'skill';
      await api.delete(`/boards/${id}`);
      navigate(`/boards/${boardType}`, { replace: true });
    } catch {
      setIsDeleting(false);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAdminDelete = async () => {
    if (!window.confirm('[관리자 권한] 이 게시글을 영구 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/boards/${id}`);
      alert('게시글이 영구 삭제되었습니다.');
      navigate(-1);
    } catch {
      setIsDeleting(false);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAdminCommentDelete = async (commentId: number) => {
    if (!window.confirm('[관리자 권한] 이 댓글을 삭제 처리하시겠습니까? (내용 치환)')) return;
    try {
      await api.patch(`/admin/comments/${commentId}/delete`);
      fetchComments();
    } catch {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const handleCommentEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleCommentUpdate = async (commentId: number) => {
    if (!editCommentContent.trim()) return;
    try {
      await api.put(`/boards/${id}/comments/${commentId}`, editCommentContent, {
        headers: { 'Content-Type': 'text/plain' }
      });
      setEditingCommentId(null);
      fetchComments();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error?.message || '댓글 수정 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/boards/${id}/comments/${commentId}`);
      fetchComments();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error?.message || '댓글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleLike = async () => {
    if (!requireMember('좋아요')) return;
    try {
      const res = await api.post(`/boards/${id}/like`);
      setBoard(prev => prev ? { 
        ...prev, 
        likeCount: res.data ? prev.likeCount + 1 : prev.likeCount - 1,
        isLiked: res.data
      } : null);
    } catch {
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleBookmark = async () => {
    if (!requireMember('북마크')) return;
    try {
      const res = await api.post(`/boards/${id}/bookmark`);
      setBoard(prev => prev ? { ...prev, isBookmarked: res.data } : null);
    } catch {
      alert('북마크 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireMember('댓글 작성')) return;
    if (!newComment.trim()) return;

    try {
      await api.post(`/boards/${id}/comments`, newComment, {
        headers: { 'Content-Type': 'text/plain' }
      });
      setNewComment('');
      fetchComments();
    } catch {
      alert('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;
  if (isNotFound) return <div className="text-center py-20">게시글을 찾을 수 없습니다.</div>;
  if (!board) return null;

  const isAuthor = currentLoginId === board.authorLoginId;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-none border-none text-slate-500 font-black cursor-pointer flex items-center gap-2"
        >
          <span>←</span> 뒤로가기
        </button>
        {isAuthor && (
          <div className="flex gap-3">
            <button onClick={handleEdit} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">수정</button>
            <button onClick={handleDelete} className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors">삭제</button>
          </div>
        )}
        {!isAuthor && role === 'ADMIN' && (
          <button onClick={handleAdminDelete} className="px-4 py-1.5 bg-red-50 text-red-600 border-none rounded-lg text-xs font-black cursor-pointer hover:bg-red-100">관리자 삭제</button>
        )}
      </div>
      
      <article className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-50 mb-10 shadow-sm">
        <header className="border-b border-slate-50 pb-8 mb-8">
          <div className="flex flex-wrap gap-2.5 mb-4">
            {board.tags.map(t => <span key={t} className="px-3 py-1 bg-blue-50 text-xs text-blue-600 font-black rounded-full">#{t}</span>)}
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 leading-tight">{board.title}</h1>
          <div className="flex flex-wrap gap-4 text-slate-400 text-sm font-medium">
            <span>{board.authorNickname}</span>
            <span className="text-slate-200">|</span>
            <span>{new Date(board.createdAt).toLocaleString()}</span>
            <span className="text-slate-200">|</span>
            <span>조회 {board.viewCount}</span>
          </div>
        </header>
        
        <div className="text-lg leading-relaxed text-slate-700 min-h-80 whitespace-pre-wrap mb-16 pt-8">{board.content}</div>
        
        <div className="flex justify-center gap-6 mt-16 pt-8 border-t border-slate-50">
          <button 
            onClick={handleLike} 
            className={`px-10 py-3.5 rounded-full border-2 font-black cursor-pointer transition-colors ${
              board.isLiked 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-blue-50 border-blue-600 text-blue-600 hover:bg-blue-100'
            }`}
          >
            👍 {board.likeCount}
          </button>
          <button 
            onClick={handleBookmark} 
            className={`px-10 py-3.5 rounded-full border-2 font-black cursor-pointer transition-colors flex items-center gap-2 ${
              board.isBookmarked
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {board.isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            북마크
          </button>
        </div>
      </article>

      <section className="px-2">
        <h3 className="text-2xl font-black mb-6">댓글 {comments.length}</h3>
        
        <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4 mb-12">
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isMember ? "따뜻한 댓글을 남겨주세요." : "로그인한 회원만 댓글을 작성할 수 있습니다."}
            disabled={!isMember}
            className="w-full h-24 p-4.5 rounded-3xl border-2 border-slate-200 text-base outline-none resize-none focus:border-blue-600 disabled:bg-slate-50 transition-all"
          />
          <button 
            type="submit" 
            disabled={!isMember || !newComment.trim()} 
            className="self-end px-8 py-3.5 bg-blue-600 text-white border-none rounded-2xl font-black cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-100"
          >
            등록
          </button>
        </form>

        <div className="flex flex-col gap-6">
          {comments.map(comment => (
            <div key={comment.id} className="border-b border-slate-50 pb-6">
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900">{comment.authorNickname}</span>
                  {currentLoginId === comment.authorLoginId && editingCommentId !== comment.id && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCommentEdit(comment)}
                        className="text-xs font-bold text-slate-600 hover:text-blue-500 transition-colors"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleCommentDelete(comment.id)}
                        className="text-xs font-bold text-slate-600 hover:text-red-500 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                  {currentLoginId !== comment.authorLoginId && role === 'ADMIN' && (
                    <button 
                      onClick={() => handleAdminCommentDelete(comment.id)}
                      className="text-xs font-black text-red-500 hover:text-red-700 transition-colors"
                    >
                      관리자 삭제
                    </button>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-medium">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="flex flex-col gap-3">
                  <textarea 
                    value={editCommentContent}
                    onChange={(e) => setEditCommentContent(e.target.value)}
                    className="w-full p-4 border-2 border-slate-200 rounded-2xl text-sm outline-none resize-none focus:border-blue-600"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingCommentId(null)} className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">취소</button>
                    <button onClick={() => handleCommentUpdate(comment.id)} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">저장</button>
                  </div>
                </div>
              ) : (
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.content}</div>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-10 text-slate-400 font-medium">첫 번째 댓글을 남겨보세요!</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BoardDetailPage;
