'use client';

import React from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

interface AddressFormProps {
  newAddr: any;
  onFieldChange: (field: string, value: string) => void;
  onSave: () => void;
  isPending: boolean;
}

export function AddressForm({ newAddr, onFieldChange, onSave, isPending }: AddressFormProps) {
  return (
    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-4 animate-in fade-in slide-in-from-top-2">
      <h3 className="text-sm font-black text-blue-900 mb-4 uppercase">New Shipping Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          placeholder="배송지 명칭 (문자/숫자 가능)" 
          value={newAddr.addressName} 
          onChange={e => onFieldChange('addressName', e.target.value)} 
        />
        <Input 
          placeholder="수령인 성함 (문자만)" 
          value={newAddr.receiverName} 
          onChange={e => onFieldChange('receiverName', e.target.value)} 
        />
        <Input 
          placeholder="연락처 (숫자만, - 제외)" 
          value={newAddr.phoneNumber} 
          onChange={e => onFieldChange('phoneNumber', e.target.value)} 
          className="md:col-span-2" 
          maxLength={11}
        />
        <Input 
          placeholder="기본 주소 (문자/숫자 가능)" 
          value={newAddr.baseAddress} 
          onChange={e => onFieldChange('baseAddress', e.target.value)} 
          className="md:col-span-2" 
        />
        <Input 
          placeholder="상세 주소" 
          value={newAddr.detailAddress} 
          onChange={e => onFieldChange('detailAddress', e.target.value)} 
          className="md:col-span-2" 
        />
      </div>
      <Button className="w-full mt-6 shadow-lg shadow-blue-200" onClick={onSave} isLoading={isPending}>배송지 저장하기</Button>
    </div>
  );
}
