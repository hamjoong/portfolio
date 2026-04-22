import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import SeniorVerifyModal from './SeniorVerifyModal';

/**
 * 프로필 수정 모달 컴포넌트
 * GEMINI.md 규칙: SRP(단일 책임 원칙) - DashboardPage에서 분리하여 300줄 규칙 준수
 */

interface UserInfo {
  id: number;
  loginId: string;
  nickname: string;
  email: string;
  contact: string;
  address: string;
  credits: number;
  ranking: number;
  profileImageUrl: string | null;
  avatarUrl: string | null;
  role: string;
}

interface ProfileEditModalProps {
  userInfo: UserInfo;
  onClose: () => void;
  onSaved: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ userInfo, onClose, onSaved }) => {
  const { role: currentRole, updateNickname, updateProfileImage, updateAvatar } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState({
    nickname: userInfo.nickname || '',
    email: userInfo.email || '',
    contact: userInfo.contact || '',
    address: userInfo.address || '',
    password: '',
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [tempObjectUrl, setTempObjectUrl] = useState<string | null>(null);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // 컴포넌트 언마운트 시 Object URL 메모리 해제
  useEffect(() => {
    return () => {
      if (tempObjectUrl) {
        URL.revokeObjectURL(tempObjectUrl);
      }
    };
  }, [tempObjectUrl]);

  /** 프로필 정보 수정 저장 */
  const handleSaveProfile = async () => {
    if (currentRole === 'GUEST') {
      alert('비회원은 수정할 수 없습니다.');
      return;
    }

    if (isUploading) {
      alert('이미지 업로드 중입니다. 잠시만 기다려 주세요.');
      return;
    }

    // 닉네임 중복 체크 삭제 (PUT 요청 시 서버에서 처리)

    try {
      // [Why] 이미지와 아바타는 상호 배타적임. 새로 업로드했으면 아바타는 null, 아바타를 선택했으면 이미지는 null.
      // 아무것도 변경하지 않았으면 기존 값을 유지함.
      let finalProfileImageUrl = userInfo.profileImageUrl;
      let finalAvatarUrl = userInfo.avatarUrl;

      if (uploadedImageUrl) {
        finalProfileImageUrl = uploadedImageUrl;
        finalAvatarUrl = null;
      } else if (tempAvatarUrl) {
        finalAvatarUrl = tempAvatarUrl;
        finalProfileImageUrl = null;
      }

      const payload = {
        ...editData,
        profileImageUrl: finalProfileImageUrl,
        avatarUrl: finalAvatarUrl,
      };

      await api.put('/users/me', payload);

      alert('프로필이 수정되었습니다.');

      // Store 업데이트 (사이드바 반영 및 세션 동기화)
      if (uploadedImageUrl) {
        updateProfileImage(finalProfileImageUrl);
      } else if (tempAvatarUrl) {
        updateAvatar(finalAvatarUrl);
      }
      updateNickname(editData.nickname);

      onSaved();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        alert(error.response.data.error.message);
      } else {
        alert('프로필 수정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  /** 모달 닫기 시 임시 상태 정리 */
  const handleCloseModal = () => {
    if (tempObjectUrl) {
      URL.revokeObjectURL(tempObjectUrl);
    }
    onClose();
  };

  /** 이미지 업로드 핸들러 */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (currentRole === 'GUEST') {
      alert('비회원은 이미지를 업로드할 수 없습니다.');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    // 이전 업로드 상태 초기화 및 로딩 시작
    setUploadedImageUrl(null);
    setTempAvatarUrl(null);
    setIsUploading(true);

    const previewUrl = URL.createObjectURL(file);
    // [Why] 즉시 미리보기를 위해 profilePreview를 업데이트
    setProfilePreview(previewUrl);
    setTempObjectUrl(previewUrl);

    const imageFormData = new FormData();
    imageFormData.append('file', file);

    try {
      const response = await api.post('/users/me/image', imageFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // API 응답 구조에 따라 URL 추출 (인터셉터에서 data 필드만 추출됨)
      const resolvedUploadUrl = typeof response.data === 'string' ? response.data : response.data?.profileImageUrl;
      setUploadedImageUrl(resolvedUploadUrl);

      alert('이미지가 업로드되었습니다. [변경사항 저장]을 눌러 완료해 주세요.');
    } catch {
      alert('이미지 업로드에 실패했습니다.');
      setProfilePreview(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    } finally {
      setIsUploading(false);
    }
  };

  /** 아바타 랜덤 변경 핸들러 */
  const handleRandomAvatar = () => {
    if (currentRole === 'GUEST') {
      alert('비회원은 아바타를 변경할 수 없습니다.');
      return;
    }
    const randomSeed = Math.random().toString(36).substring(7);
    const avatarApiUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;

    // [Why] 아바타 미리보기를 위해 tempAvatarUrl을 업데이트하고, 이미지 관련 상태를 초기화함.
    setTempAvatarUrl(avatarApiUrl);
    setUploadedImageUrl(null);
    setProfilePreview(null);
    if (tempObjectUrl) {
      URL.revokeObjectURL(tempObjectUrl);
      setTempObjectUrl(null);
    }
  };

  /** 현재 표시할 프로필 이미지 URL 결정 */
  const displayImageUrl = profilePreview || tempAvatarUrl || userInfo.profileImageUrl || userInfo.avatarUrl;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur z-[2000] flex justify-center items-center">
        {/* [Why] 비밀번호 필드가 포함된 입력 영역을 <form>으로 감싸 브라우저 보안 표준 및 비밀번호 관리자 최적화 준수 */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}
          className="w-full max-w-2xl bg-white rounded-4xl shadow-2xl overflow-hidden"
        >
          <header className="px-12 py-8 border-b border-slate-100 flex justify-between items-center">
            <h2 className="m-0 text-2xl font-bold">프로필 설정</h2>
            <button type="button" onClick={handleCloseModal} className="bg-none border-none text-2xl cursor-pointer text-slate-400">✕</button>
          </header>

          <div className="px-12 py-12 max-h-[70vh] overflow-y-auto">
            <div className="text-center mb-10">
              <div className="w-36 h-36 rounded-[2.5rem] bg-slate-50 mx-auto mb-8 overflow-hidden border-8 border-white shadow-lg flex items-center justify-center">
                {displayImageUrl ? (
                  <img
                    src={displayImageUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-center mb-8">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 border-none rounded-2xl cursor-pointer">이미지 업로드</button>
                <button type="button" onClick={handleRandomAvatar} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 border-none rounded-2xl cursor-pointer">아바타 랜덤</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-slate-600">아이디</label>
                {/* [Why] 아이디 필드에 autoComplete="username"을 추가하여 비밀번호 필드와 쌍을 이루도록 함 */}
                <input 
                  type="text" 
                  value={userInfo.loginId} 
                  disabled 
                  autoComplete="username"
                  className="px-5 py-3 border-2 border-slate-200 rounded-2xl text-base text-slate-600 bg-slate-100 font-semibold cursor-not-allowed" 
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-slate-600">현재 역할</label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1 px-5 py-3 border-2 border-slate-100 rounded-2xl text-base text-slate-800 bg-slate-50 font-black">
                    {userInfo.role === 'ADMIN' ? '관리자' : userInfo.role === 'SENIOR' ? '시니어 개발자' : '주니어 (일반)'}
                  </div>
                  {userInfo.role === 'USER' && (
                    <button 
                      type="button" 
                      onClick={() => setIsVerifyModalOpen(true)}
                      className="px-4 py-3 bg-blue-50 text-blue-600 border-none rounded-2xl text-xs font-black cursor-pointer hover:bg-blue-100"
                    >
                      시니어 인증
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-slate-600">닉네임</label>
                {/* [Why] 사용자 별명 필드임을 브라우저에 알려 자동 완성을 최적화함 */}
                <input 
                  type="text" 
                  value={editData.nickname} 
                  autoComplete="nickname"
                  className="px-5 py-3 border-2 border-slate-100 rounded-2xl text-base text-black bg-slate-50 font-semibold focus:border-blue-600 outline-none" 
                  onChange={(event) => setEditData({ ...editData, nickname: event.target.value })} 
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-slate-600">이메일</label>
                {/* [Why] 브라우저 보안 경고 해결 및 이메일 자동 완성을 위해 autoComplete="email" 설정 */}
                <input 
                  type="email" 
                  value={editData.email} 
                  autoComplete="email"
                  className="px-5 py-3 border-2 border-slate-100 rounded-2xl text-base text-black bg-slate-50 font-semibold" 
                  onChange={(event) => setEditData({ ...editData, email: event.target.value })} 
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-slate-600">비밀번호</label>
                {/* [Why] 비밀번호 변경 필드에서 브라우저의 자동 완성 제안을 최적화하고 보안 경고를 방지함 */}
                <input 
                  type="password" 
                  placeholder="변경할 때만 입력" 
                  autoComplete="new-password"
                  className="px-5 py-3 border-2 border-slate-100 rounded-2xl text-base text-black bg-slate-50 font-semibold" 
                  onChange={(event) => setEditData({ ...editData, password: event.target.value })} 
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-bold text-slate-600">연락처</label>
                {/* [Why] 전화번호 형식의 자동 완성을 지원함 */}
                <input 
                  type="text" 
                  value={editData.contact} 
                  autoComplete="tel"
                  className="px-5 py-3 border-2 border-slate-100 rounded-2xl text-base text-black bg-slate-50 font-semibold" 
                  onChange={(event) => setEditData({ ...editData, contact: event.target.value })} 
                />
              </div>
              <div className="flex flex-col gap-2.5 col-span-2">
                <label className="text-sm font-bold text-slate-600">주소</label>
                {/* [Why] 상세 주소 필드임을 명시함 */}
                <input 
                  type="text" 
                  value={editData.address} 
                  autoComplete="street-address"
                  className="px-5 py-3 border-2 border-slate-100 rounded-2xl text-base text-black bg-slate-50 font-semibold" 
                  onChange={(event) => setEditData({ ...editData, address: event.target.value })} 
                />
              </div>
            </div>
          </div>

          <footer className="px-12 py-8 border-t border-slate-100 flex justify-end">
            <button type="submit" className="px-10 py-3 text-lg font-bold text-white bg-blue-600 border-none rounded-2xl cursor-pointer shadow-lg">변경사항 저장</button>
          </footer>
        </form>
      </div>

      {isVerifyModalOpen && (
        <SeniorVerifyModal 
          onClose={() => setIsVerifyModalOpen(false)} 
          onSubmitted={() => {
            setIsVerifyModalOpen(false);
            onSaved();
          }} 
        />
      )}
    </>
  );
};

export default ProfileEditModal;
