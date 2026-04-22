import React, { useState } from 'react';
import api from '../../services/api';
import axios, { AxiosError } from 'axios';

interface SeniorVerifyModalProps {
  onClose: () => void;
  onSubmitted: () => void;
}

const SeniorVerifyModal: React.FC<SeniorVerifyModalProps> = ({ onClose, onSubmitted }) => {
  const [formData, setFormData] = useState({
    githubUrl: '',
    linkedInUrl: '',
    blogUrl: '',
    careerSummary: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.careerSummary.trim()) return alert('경력 요약 및 참여 프로젝트 내용을 입력해 주세요.');

    setIsLoading(true);
    try {
      await api.post('/users/me/verify-senior', formData);
      alert('시니어 인증 요청이 접수되었습니다. 관리자 승인 후 시니어 권한이 부여됩니다.');
      onSubmitted();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{error: {message: string}}>;
        alert(axiosError.response?.data?.error?.message || '인증 요청 중 오류가 발생했습니다.');
      } else {
        alert('인증 요청 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-md z-[3000] flex justify-center items-center p-4">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-10 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900">시니어 개발자 인증 신청</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl bg-transparent border-none cursor-pointer">✕</button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-600">GitHub URL</label>
              <input 
                type="url" 
                value={formData.githubUrl}
                onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                placeholder="https://github.com/username"
                className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-600">LinkedIn URL</label>
              <input 
                type="url" 
                value={formData.linkedInUrl}
                onChange={(e) => setFormData({...formData, linkedInUrl: e.target.value})}
                placeholder="https://linkedin.com/in/username"
                className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-600">개인 기술 블로그 URL</label>
              <input 
                type="url" 
                value={formData.blogUrl}
                onChange={(e) => setFormData({...formData, blogUrl: e.target.value})}
                placeholder="https://velog.io/@username"
                className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-600">경력 요약 및 참여 프로젝트 <span className="text-red-500">*</span></label>
              <textarea 
                value={formData.careerSummary}
                onChange={(e) => setFormData({...formData, careerSummary: e.target.value})}
                required
                placeholder="본인의 연차, 주요 기술 스택, 수행했던 프로젝트 경험을 자세히 적어주세요."
                className="w-full h-40 px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all resize-none"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <p className="text-xs text-blue-700 font-bold leading-relaxed">
              💡 시니어 개발자로 인증되면 시니어 리뷰 게시판에서 리뷰어로 활동하며 크레딧 보상을 받을 수 있습니다. 관리자가 제출하신 정보를 검토하여 1~3일 내에 결과를 알려드립니다.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black cursor-pointer hover:bg-slate-200 transition-colors">취소</button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-2 py-4 bg-blue-600 text-white rounded-2xl font-black cursor-pointer shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {isLoading ? '신청 중...' : '인증 신청하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeniorVerifyModal;
