'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface AddressListProps {
  addresses: any[];
  onDelete: (id: string) => void;
}

export function AddressList({ addresses, onDelete }: AddressListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {addresses.map((addr) => (
        <div key={addr.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 uppercase text-sm">{addr.addressName}</span>
              {addr.isDefault && <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase">Default</span>}
            </div>
            <p className="text-xs text-gray-500 font-medium">{addr.receiverName} · {addr.phoneNumber}</p>
            <p className="text-sm text-gray-700 mt-1 font-bold">{addr.baseAddress} {addr.detailAddress}</p>
          </div>
          <button 
            onClick={() => onDelete(addr.id)}
            className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all flex items-center justify-center border border-gray-100"
            title="배송지 삭제"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}
