import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { normalizeTag } from '../../utils/tagUtils';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import axios from 'axios';

const BoardWritePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { requireMember } = useAuthGuard();
  
  const editMode = searchParams.get('edit') === 'true';
  const boardId = searchParams.get('id');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: searchParams.get('type') || 'SKILL',
    tags: ''
  });

  useEffect(() => {
    // [Why] 게시글 작성/수정은 회원만 가능하므로 공통 인증 가드를 적용함.
    if (!requireMember('게시글 작성')) {
      navigate(-1);
    }
  }, [requireMember, navigate]);

  useEffect(() => {
    if (editMode && boardId) {
      const fetchBoard = async () => {
        try {
          const res = await api.get(`/boards/${boardId}`);
          setFormData({
            title: res.data.title,
            content: res.data.content,
            type: res.data.type || 'SKILL',
            tags: res.data.tags.join(', ')
          });
        } catch (error: unknown) {
          console.error('Failed to fetch board for edit:', error);
          if (axios.isAxiosError(error)) {
            alert(error.response?.data?.error?.message || '게시글 정보를 불러오는 데 실패했습니다.');
          }
          navigate(-1);
        }
      };
      fetchBoard();
    }
  }, [editMode, boardId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return alert('제목을 입력해 주세요.');
    if (!formData.content.trim()) return alert('내용을 입력해 주세요.');

    /** [Why] 전송 전 데이터를 정규화하여 백엔드의 부담을 줄이고 데이터 무결성을 유지함. */
    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      type: formData.type,
      tags: formData.tags 
        ? formData.tags.split(',')
            .map(t => normalizeTag(t.trim()))
            .filter(t => t !== '')
        : []
    };

    try {
      if (editMode && boardId) {
        await api.put(`/boards/${boardId}`, payload);
        alert('게시글이 수정되었습니다.');
        navigate(`/boards/${boardId}`);
      } else {
        await api.post('/boards', payload);
        alert('게시글이 등록되었습니다.');
        
        /** [Why] 등록 후 목록 이동 시 replace: true를 사용하여 브라우저 히스토리를 정리하고, 
         *  타임스탬프를 쿼리에 추가하여 캐시를 무시한 최신 목록 로드를 강제함. */
        navigate(`/boards/${formData.type.toLowerCase()}?page=0&t=${Date.now()}`, { replace: true });
      }
    } catch (error: unknown) {
      console.error("Board submission error:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error?.message || '게시글 저장 중 오류가 발생했습니다.');
      }
    }
  };

  const boardTitle = formData.type === 'SKILL' ? 'IT 스킬' : 'AI 정보';

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col">
      <h1 className="text-2xl font-black mb-5 text-slate-900">{boardTitle} 게시글 {editMode ? '수정' : '작성'}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-slate-600">게시판 카테고리</label>
          <div className="inline-block px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-base font-bold text-slate-800">
            {formData.type === 'SKILL' ? '📊 IT 스킬 게시판' : '🤖 AI 정보 게시판'}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-slate-600">제목</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder={`${boardTitle} 관련 제목을 입력하세요`}
            className="px-4 py-3 border border-slate-200 rounded-2xl text-base outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-slate-600">태그 (쉼표로 구분)</label>
          <input 
            type="text" 
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder={formData.type === 'SKILL' ? "예: FrontEnd, React, Java" : "예: Chat GPT, Gemini, Claude"}
            className="px-4 py-3 border border-slate-200 rounded-2xl text-base outline-none w-full block"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-slate-600">내용</label>
          <textarea 
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="내용을 입력하세요"
            className="px-4 py-3 border border-slate-200 rounded-2xl text-base flex-1 min-h-[150px] resize-none"
            required
          />
        </div>

        <div className="flex justify-end gap-4 pt-5 border-t border-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="px-9 py-3.5 bg-slate-100 text-slate-600 border-none rounded-2xl text-base font-bold cursor-pointer">취소</button>
          <button type="submit" className="px-9 py-3.5 bg-blue-600 text-white border-none rounded-2xl text-base font-bold cursor-pointer shadow-lg">
            {editMode ? '수정하기' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardWritePage;
