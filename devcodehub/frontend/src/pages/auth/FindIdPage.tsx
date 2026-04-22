import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';

const FindIdPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', contact: '' });
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;

    if (name === 'email') {
      filteredValue = value.replace(/\s/g, '');
    } else if (name === 'contact') {
      filteredValue = value.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: filteredValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/find-id', formData);
      setResult(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // backend ApiResponse error structure: {"success": false, "error": {"code": "...", "message": "..."}}
        const errorMessage = error.response?.data?.error?.message || '일치하는 정보를 찾을 수 없습니다.';
        alert(errorMessage);
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-16 p-14 bg-white rounded-3xl shadow-md border border-slate-200">
      <h2 className="text-center mb-3.5 font-black text-slate-900 text-2xl">아이디 찾기</h2>
      <p className="text-center text-slate-600 mb-10 text-base font-medium">
        가입 시 입력한 정보로 아이디를 찾을 수 있습니다.
      </p>

      {result ? (
        <div className="text-center p-8 bg-slate-100 rounded-2xl">
          <p className="text-lg font-black text-slate-900 mb-6">{result}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="py-4 px-8 w-full bg-blue-600 text-white border-none rounded-2xl text-lg font-black cursor-pointer hover:bg-blue-700 transition-colors mt-4"
          >
            로그인하러 가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5.5">
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-bold text-slate-700">이메일</label>
            {/* [Why] 브라우저 자동 완성 최적화 및 보안 경고 해결을 위해 autoComplete 추가 */}
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              autoComplete="email"
              className="w-full py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600" 
              placeholder="example@email.com" 
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-bold text-slate-700">연락처</label>
            {/* [Why] 전화번호 형식 자동 완성 지원 */}
            <input 
              type="text" 
              name="contact" 
              value={formData.contact} 
              onChange={handleChange} 
              required 
              autoComplete="tel"
              className="w-full py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600" 
              placeholder="숫자만 입력" 
            />
          </div>
          <button 
            type="submit" 
            className="py-4 bg-blue-600 text-white border-none rounded-2xl text-lg font-black cursor-pointer mt-4 hover:bg-blue-700 transition-colors disabled:opacity-50" 
            disabled={isLoading}
          >
            {isLoading ? '조회 중...' : '아이디 찾기'}
          </button>
        </form>
      )}
      
      <div className="mt-10 text-center">
        <span 
          onClick={() => navigate('/login')} 
          className="text-slate-500 text-base font-black cursor-pointer underline hover:text-slate-700"
        >
          로그인으로 돌아가기
        </span>
      </div>
    </div>
  );
};

export default FindIdPage;
