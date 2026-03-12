'use client';

import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Building, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('CARD');

  const methods = [
    { id: 'CARD', label: '신용/체크카드', icon: <CreditCard size={24} />, description: '모든 카드 결제 가능' },
    { id: 'PHONE', label: '휴대폰 결제', icon: <Smartphone size={24} />, description: '통신사 통합 결제' },
    { id: 'BANK', label: '무통장 입금', icon: <Building size={24} />, description: '가상계좌 발급' },
  ];

  const handleSave = () => {
    alert('기본 결제 수단이 변경되었습니다.');
    router.back();
  };

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
            <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
              <CreditCard size={32} className="text-blue-600" />
              결제 수단 설정
            </h1>
            <p className="text-gray-500 font-medium">주문 시 사용할 기본 결제 수단을 관리합니다.</p>
          </div>

          <div className="space-y-4 mb-10">
            {methods.map((method) => (
              <div 
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex items-center gap-6 p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedMethod === method.id 
                    ? 'border-blue-600 bg-blue-50/30' 
                    : 'border-gray-50 bg-white hover:border-gray-200'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  selectedMethod === method.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="text-base font-black text-gray-900">{method.label}</div>
                  <div className="text-xs text-gray-400 font-bold">{method.description}</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === method.id ? 'border-blue-600 bg-blue-600' : 'border-gray-200'
                }`}>
                  {selectedMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 mb-10 flex items-start gap-4">
            <ShieldCheck size={20} className="text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700 font-bold leading-relaxed">
              결제 정보는 안전하게 암호화되어 관리됩니다. 프로젝트 X는 고객님의 결제 비밀번호를 직접 저장하지 않습니다.
            </p>
          </div>

          <Button 
            className="w-full py-4 shadow-lg shadow-blue-100"
            onClick={handleSave}
          >
            설정 저장하기
          </Button>
        </div>
      </div>
    </div>
  );
}
