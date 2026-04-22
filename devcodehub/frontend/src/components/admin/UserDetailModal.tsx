import React, { useState } from 'react';
import api from '../../services/api';
import axios, { AxiosError } from 'axios';

interface UserInfo {
  id: number;
  loginId: string;
  nickname: string;
  email: string;
  role: string;
  credits: number;
}

interface UserDetailModalProps {
  user: UserInfo;
  onClose: () => void;
  onUpdated: () => void;
}

interface ErrorResponse {
  error?: {
    message?: string;
  };
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onUpdated }) => {
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdjustCredits = async () => {
    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount === 0) return alert('올바른 조정 금액(숫자)을 입력하세요.');
    if (amount > 999999) return alert('한 번에 999,999 C를 초과하여 지급할 수 없습니다.');
    if (amount < 0 && Math.abs(amount) > user.credits) {
      return alert(`보유 잔액(${user.credits.toLocaleString()} C)보다 많은 금액을 차감할 수 없습니다.`);
    }
    if (!reason.trim()) return alert('조정 사유를 입력하세요.');

    setIsSubmitting(true);
    try {
      await api.post(`/admin/users/${user.loginId}/adjust-credits`, {
        amount: amount,
        reason: reason.trim()
      });
      alert('크레딧이 성공적으로 조정되었습니다.');
      onUpdated();
    } catch (error: unknown) {
      console.error('Failed to adjust credits:', error);
      let message = '크레딧 조정에 실패했습니다.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        message = axiosError.response?.data?.error?.message || message;
      }
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-md z-[3000] flex justify-center items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-10 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900">사용자 상세 관리</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl cursor-pointer bg-transparent border-none">✕</button>
        </header>

        <div className="p-10 space-y-10">
          <section className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">기본 정보</p>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">{user.nickname}</h3>
                <p className="text-slate-500 font-bold">@{user.loginId}</p>
                <p className="text-slate-500 font-medium text-sm">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">현재 잔액</p>
              <div className="text-3xl font-black text-blue-600">{user.credits.toLocaleString()} C</div>
              <span className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase">{user.role}</span>
            </div>
          </section>

          <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
              🔧 크레딧 수동 조정
            </h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  value={adjustAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '-' || /^-?\d+$/.test(val)) {
                      setAdjustAmount(val);
                    }
                  }}
                  placeholder="예: 500 (증가) / -500 (차감)"
                  className="flex-1 px-6 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-lg font-black outline-none focus:border-blue-600 transition-all"
                />
                <span className="font-black text-slate-400">Credits</span>
              </div>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="조정 사유를 상세히 입력해 주세요 (예: 결제 오류 보상, 비정상 활동 회수)"
                className="w-full h-32 px-6 py-4 bg-white border-2 border-slate-200 rounded-3xl text-sm font-medium outline-none focus:border-blue-600 transition-all resize-none"
              />
              <button 
                onClick={handleAdjustCredits}
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 text-white border-none rounded-2xl text-lg font-black cursor-pointer shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? '처리 중' : '크레딧 반영하기'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
