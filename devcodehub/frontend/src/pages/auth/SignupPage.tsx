import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: '', nickname: '', email: '', password: '', confirmPassword: '', contact: '', address: ''
  });
  
  const [checks, setChecks] = useState({
    id: { checked: false, available: false, message: '' },
    email: { checked: false, available: false, message: '' },
    nickname: { checked: false, available: false, message: '' }
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 값이 변경되면 중복 체크 상태 초기화
    if (name === 'loginId') {
      setChecks(prev => ({ ...prev, id: { checked: false, available: false, message: '' } }));
    } else if (name === 'email') {
      setChecks(prev => ({ ...prev, email: { checked: false, available: false, message: '' } }));
    } else if (name === 'nickname') {
      setChecks(prev => ({ ...prev, nickname: { checked: false, available: false, message: '' } }));
    }
  };

  /** [Why] 중복된 아이디 가입을 방지하기 위해 서버에 실시간으로 존재 여부를 요청함. */
  const handleCheckId = async () => {
    if (!formData.loginId.trim()) return alert('아이디를 입력해 주세요.');
    if (!/^[a-zA-Z0-9]*$/.test(formData.loginId)) return alert('아이디는 영문자와 숫자만 가능합니다.');

    try {
      const response = await api.get(`/auth/check-id?loginId=${formData.loginId}`);
      const isDuplicate = response.data;
      setChecks(prev => ({
        ...prev,
        id: { 
          checked: true, 
          available: !isDuplicate, 
          message: isDuplicate ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.' 
        }
      }));
    } catch {
      alert('중복 확인 중 오류가 발생했습니다.');
    }
  };

  /** [Why] 커뮤니티 내 고유한 닉네임 사용을 보장하기 위해 제출 전 중복 검사를 강제함. */
  const handleCheckNickname = async () => {
    if (!formData.nickname.trim()) return alert('닉네임을 입력해 주세요.');

    try {
      const response = await api.get(`/auth/check-nickname?nickname=${formData.nickname}`);
      const isDuplicate = response.data;
      setChecks(prev => ({
        ...prev,
        nickname: { 
          checked: true, 
          available: !isDuplicate, 
          message: isDuplicate ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.' 
        }
      }));
    } catch {
      alert('중복 확인 중 오류가 발생했습니다.');
    }
  };

  /** [Why] 이메일 중복 방지를 위한 확인 로직 추가 */
  const handleCheckEmail = async () => {
    if (!formData.email.trim()) return alert('이메일을 입력해 주세요.');
    try {
      const response = await api.get(`/auth/check-email?email=${formData.email}`);
      const isDuplicate = response.data;
      setChecks(prev => ({
        ...prev,
        email: { 
          checked: true, 
          available: !isDuplicate, 
          message: isDuplicate ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.' 
        }
      }));
    } catch {
      alert('중복 확인 중 오류가 발생했습니다.');
    }
  };

  /** [Why] 모든 유효성 검사(중복 체크, 비밀번호 일치 등)를 통과한 경우에만 최종 가입 요청을 서버에 전송함. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checks.id.available) return alert('아이디 중복 확인이 필요합니다.');
    if (!checks.email.available) return alert('이메일 중복 확인이 필요합니다.');
    if (!checks.nickname.available) return alert('닉네임 중복 확인이 필요합니다.');
    if (formData.password !== formData.confirmPassword) return alert('비밀번호가 일치하지 않습니다.');

    const { ...signupData } = formData;
    
    setIsLoading(true);
    try {
      await api.post('/auth/signup', signupData);
      alert('회원가입이 완료되었습니다. 로그인해 주세요!');
      navigate('/login');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as { error?: { message: string } };
        alert(errorData?.error?.message || '회원가입에 실패했습니다. 입력 양식을 확인해 주세요.');
      } else {
        alert('회원가입 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageClasses = (available: boolean) => {
    return `text-xs font-semibold mt-0.5 ml-1 ${available ? 'text-green-600' : 'text-red-600'}`;
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-14 bg-white rounded-3xl shadow-md border border-slate-200">
      <h2 className="text-center mb-3.5 font-black text-slate-900 text-2xl">회원가입</h2>
      <p className="text-center text-slate-600 mb-10 text-base font-medium">
        DevCodeHub의 가족이 되어 성장을 시작하세요.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5.5" autoComplete="off">
        {/* 아이디 영역 */}
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-slate-700">아이디</label>
          <div className="flex gap-3.5">
            {/* [Why] 브라우저가 이 필드를 계정 식별자로 인식하도록 autoComplete="username" 설정 */}
            <input 
              type="text" 
              name="loginId" 
              value={formData.loginId} 
              onChange={handleChange} 
              required 
              autoComplete="username"
              className="w-full py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600" 
              placeholder="영문/숫자 조합" 
            />
            <button 
              type="button" 
              onClick={handleCheckId} 
              className="px-4.5 bg-slate-100 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-600 cursor-pointer whitespace-nowrap hover:bg-slate-200"
            >
              중복 확인
            </button>
          </div>
          {checks.id.message && <p className={getMessageClasses(checks.id.available)}>{checks.id.message}</p>}
        </div>

        {/* 닉네임 영역 */}
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-slate-700">닉네임</label>
          <div className="flex gap-3.5">
            {/* [Why] 닉네임 필드에 적절한 자동 완성 힌트 제공 */}
            <input 
              type="text" 
              name="nickname" 
              value={formData.nickname} 
              onChange={handleChange} 
              required 
              autoComplete="nickname"
              className="w-full py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600" 
              placeholder="사용할 닉네임" 
            />
            <button 
              type="button" 
              onClick={handleCheckNickname} 
              className="px-4.5 bg-slate-100 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-600 cursor-pointer whitespace-nowrap hover:bg-slate-200"
            >
              중복 확인
            </button>
          </div>
          {checks.nickname.message && <p className={getMessageClasses(checks.nickname.available)}>{checks.nickname.message}</p>}
        </div>

        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-slate-700">이메일</label>
          <div className="flex gap-3.5">
            {/* [Why] 브라우저 경고 해결 및 이메일 자동 완성을 위해 autoComplete="email" 설정 */}
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
            <button 
              type="button" 
              onClick={handleCheckEmail} 
              className="px-4.5 bg-slate-100 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-600 cursor-pointer whitespace-nowrap hover:bg-slate-200"
            >
              중복 확인
            </button>
          </div>
          {checks.email.message && <p className={getMessageClasses(checks.email.available)}>{checks.email.message}</p>}
        </div>
        
        <div className="flex gap-4 w-full">
          <div className="flex flex-col gap-2.5 flex-1">
            <label className="text-sm font-bold text-slate-700">비밀번호</label>
            {/* [Why] 브라우저 보안 경고 해결 및 비밀번호 관리자 최적화를 위해 autoComplete="new-password" 추가 */}
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              autoComplete="new-password"
              className="w-full py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600" 
              placeholder="비밀번호" 
            />
          </div>
          <div className="flex flex-col gap-2.5 flex-1">
            <label className="text-sm font-bold text-slate-700">비밀번호 확인</label>
            {/* [Why] 비밀번호 확인 필드에도 동일한 autoComplete 속성을 적용하여 브라우저의 혼동을 방지함 */}
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              autoComplete="new-password"
              className="w-full py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600" 
              placeholder="한번 더 입력" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-slate-700">연락처</label>
          <input 
            type="text" 
            name="contact" 
            value={formData.contact} 
            onChange={handleChange} 
            required 
            className="w-full py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600" 
            placeholder="010-0000-0000" 
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-slate-700">주소</label>
          <input 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            className="w-full py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600" 
            placeholder="예: 서울시 강남구 ... 101동 101호" 
          />
        </div>

        <button 
          type="submit" 
          className="py-4 bg-blue-600 text-white border-none rounded-2xl text-lg font-black cursor-pointer mt-6 hover:bg-blue-700 transition-colors disabled:opacity-50" 
          disabled={isLoading}
        >
          {isLoading ? '가입 처리 중...' : '가입 완료'}
        </button>
      </form>

      <div className="mt-10 text-center text-base text-slate-500">
        이미 계정이 있으신가요? <span 
          onClick={() => navigate('/login')} 
          className="text-blue-600 font-black cursor-pointer ml-2 hover:text-blue-700"
        >
          로그인하기
        </span>
      </div>
    </div>
  );
};

export default SignupPage;
