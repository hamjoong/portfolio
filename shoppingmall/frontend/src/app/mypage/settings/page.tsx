'use client';

import React, { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/types/auth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Phone, MapPin } from 'lucide-react';

/**
 * 사용자 정보 수정 페이지입니다.
 * [이유] KMS로 암호화된 본인의 정보를 안전하게 조회하고, 
 * 이름, 연락처, 주소 등의 개인정보를 수정하여 저장하기 위함입니다.
 */
export default function SettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    detailAddress: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getMyProfile();
        setFormData({
          fullName: profile.fullName || '',
          phoneNumber: profile.phoneNumber || '',
          address: profile.address || '',
          detailAddress: profile.detailAddress || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        alert('정보를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = '이름을 입력해주세요.';
    if (!formData.phoneNumber) newErrors.phoneNumber = '연락처를 입력해주세요.';
    if (!formData.address) newErrors.address = '주소를 입력해주세요.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await userService.updateProfile(formData);
      alert('회원 정보가 성공적으로 수정되었습니다.');
      router.push('/mypage');
    } catch (err) {
      console.error('Update failed:', err);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-20 text-center font-bold text-gray-400">정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          돌아가기
        </button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2">회원 정보 수정</h1>
            <p className="text-gray-500 font-medium">안전한 쇼핑을 위해 최신 정보를 유지해주세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="relative opacity-60">
                <Input 
                  label="이름 (수정 불가)" 
                  value={formData.fullName}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                  icon={<User size={18} className="text-gray-400" />}
                />
              </div>

              <Input 
                label="연락처 수정" 
                placeholder="숫자만 입력"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/[^0-9]/g, '') })}
                error={errors.phoneNumber}
                icon={<Phone size={18} className="text-gray-400" />}
                maxLength={11}
              />

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">기본 배송지 주소 설정</h3>
                <Input 
                  label="주소" 
                  placeholder="도로명 주소를 입력하세요"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  error={errors.address}
                  icon={<MapPin size={18} className="text-gray-400" />}
                />
                <Input 
                  placeholder="상세 주소를 입력하세요"
                  value={formData.detailAddress}
                  onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 py-4"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                className="flex-[2] py-4 shadow-lg shadow-blue-100"
                isLoading={isSubmitting}
              >
                <div className="flex items-center justify-center gap-2">
                  <Save size={20} />
                  수정 완료
                </div>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
