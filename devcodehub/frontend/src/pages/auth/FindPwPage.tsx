import React from 'react';
import { useNavigate } from 'react-router-dom';

// [Why] 메일 발송 수단이 없는 데모 서비스라, 화면에서 임시 비밀번호를 내주면 계정 탈취 경로가 된다.
//       그래서 자가 재설정 대신 관리자 문의로 안내한다.
const FindPwPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto my-12 p-6 sm:p-14 bg-white rounded-3xl shadow-md border border-slate-200">
      <h2 className="text-center mb-3.5 font-black text-slate-900 text-2xl">비밀번호 찾기</h2>
      <p className="text-center text-slate-600 mb-10 text-base font-medium break-words">
        이 서비스는 이메일 발송 기능이 없어 비밀번호를 직접 재설정할 수 없습니다.
      </p>

      <div className="p-8 bg-slate-100 rounded-2xl text-center">
        <p className="text-base font-bold text-slate-900 leading-relaxed break-words">
          비밀번호를 잊으셨다면 관리자에게 문의해 주세요.
          <br />
          아이디를 모르신다면 먼저 아이디 찾기를 이용해 주세요.
        </p>
        <button
          onClick={() => navigate('/find-id')}
          className="py-4 px-8 w-full bg-white text-slate-700 border-2 border-slate-200 rounded-2xl text-lg font-black cursor-pointer hover:bg-slate-50 transition-colors mt-6"
        >
          아이디 찾기
        </button>
        <button
          onClick={() => navigate('/login')}
          className="py-4 px-8 w-full bg-blue-600 text-white border-none rounded-2xl text-lg font-black cursor-pointer hover:bg-blue-700 transition-colors mt-4"
        >
          로그인하러 가기
        </button>
      </div>
    </div>
  );
};

export default FindPwPage;
