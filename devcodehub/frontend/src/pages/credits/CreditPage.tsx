import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

interface CreditInfo {
  credits: number;
  totalSpentCredits: number;
  plan?: string;
}

interface Transaction {
  id: number;
  createdAt: string;
  type: string;
  typeDescription: string;
  amount: number;
  balanceAfter: number;
}

interface ErrorResponse {
  error: {
    message: string;
  };
}

declare global {
  interface Window {
    PortOne: {
      requestPayment: (params: {
        storeId: string;
        paymentId: string;
        orderName: string;
        totalAmount: number;
        currency: string;
        channelKey: string;
        payMethod: string;
        customer: { fullName: string };
        windowType: { pc: string; mobile: string };
        redirectUrl: string;
      }) => Promise<{ code?: string; message?: string; paymentId: string }>;
    };
  }
}

const CreditPage: React.FC = () => {
  const { isLoggedIn, role, nickname } = useAuthStore(useShallow((state) => ({
    isLoggedIn: state.isLoggedIn,
    role: state.role,
    nickname: state.nickname
  })));
  
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [validating, setValidating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [balanceRes, txRes] = await Promise.all([
        api.get<CreditInfo>('/credits/balance'),
        api.get<{ content: Transaction[] }>('/credits/transactions')
      ]);
      setCreditInfo(balanceRes.data);
      setTransactions(txRes.data.content);
    } catch (error) {
      console.error('Failed to fetch credit data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && role !== 'GUEST') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, role, fetchData]);

  useEffect(() => {
    const imp_uid = searchParams.get('imp_uid');
    const merchant_uid = searchParams.get('merchant_uid');
    const success = searchParams.get('success');

    if (imp_uid && merchant_uid && success === 'true' && isLoggedIn && !validating) {
      const validatePayment = async () => {
        setValidating(true);
        try {
          if (merchant_uid.startsWith('sub_')) {
            const plan = searchParams.get('plan') || merchant_uid.split('_')[1].toUpperCase();
            const amount = parseInt(searchParams.get('amount') || '0');
            await api.post('/credits/subscribe/validate', {
              plan: plan,
              impUid: imp_uid,
              amount: amount
            });
            alert('구독이 완료되었습니다!');
          } else {
            const amount = parseInt(searchParams.get('amount') || '0');
            await api.post('/credits/validate', {
              impUid: imp_uid,
              merchantUid: merchant_uid,
              amount: amount
            });
            alert('충전이 완료되었습니다!');
          }
          fetchData();
        } catch (error) {
          console.error('Payment validation failed:', error);
          alert('결제 검증에 실패했습니다.');
        } finally {
          setValidating(false);
          setSearchParams({});
        }
      };
      validatePayment();
    }
  }, [searchParams, isLoggedIn, validating, fetchData, setSearchParams]);

  const handleSubscribe = async (plan: string) => {
    if (!window.confirm(`${plan} 플랜을 구독하시겠습니까?`)) return;
    
    const planPrices: Record<string, number> = {
      'WEEKLY': 3000,
      'MONTHLY': 9900,
      'YEARLY': 99000
    };
    const amount = planPrices[plan];

    const paymentId = `sub_${plan.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    try {
      const response = await window.PortOne.requestPayment({
        storeId: import.meta.env.VITE_PORTONE_STORE_ID,
        paymentId: paymentId,
        orderName: `${plan} 플랜 구독`,
        totalAmount: amount,
        currency: 'KRW',
        channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
        payMethod: 'EASY_PAY',
        customer: { fullName: nickname ?? 'User' },
        windowType: { pc: 'IFRAME', mobile: 'REDIRECTION' },
        redirectUrl: `${window.location.origin}/credits?plan=${plan}&amount=${amount}`
      });

      if (response && !response.code) {
        try {
          await api.post('/credits/subscribe/validate', {
            plan: plan,
            impUid: response.paymentId,
            amount: amount
          });
          alert('구독이 완료되었습니다. 프리미엄 혜택이 즉시 적용됩니다.');
          fetchData();
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            const data = error.response?.data as ErrorResponse;
            const message = data?.error?.message || '구독 검증 중 오류가 발생했습니다.';
            alert(message);
          } else {
            alert('구독 검증 중 알 수 없는 오류가 발생했습니다.');
          }
        }
      } else if (response && response.code) {
        alert(`결제에 실패하였습니다. (${response.code}) ${response.message}`);
      }
    } catch (e) {
      console.error('Payment request failed:', e);
    }
  };

  const handleUnsubscribe = async () => {
    if (!window.confirm('구독을 해지하시겠습니까? 남은 기간에 대해 크레딧이 환급됩니다.')) return;
    try {
      await api.post('/credits/unsubscribe');
      alert('구독이 해지되었습니다.');
      fetchData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as ErrorResponse;
        alert(data?.error?.message || '구독 해지 중 오류가 발생했습니다.');
      } else {
        alert('구독 해지 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleRecharge = async (amount: number) => {
    if (!window.confirm(`${amount.toLocaleString()}C를 충전하시겠습니까?`)) return;

    const paymentId = `ord${Date.now()}${Math.floor(Math.random() * 1000)}`;

    try {
      const response = await window.PortOne.requestPayment({
        storeId: import.meta.env.VITE_PORTONE_STORE_ID,
        paymentId: paymentId,
        orderName: `크레딧 ${amount.toLocaleString()}C 충전`,
        totalAmount: amount,
        currency: 'KRW',
        channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
        payMethod: 'EASY_PAY',
        customer: { fullName: nickname ?? 'User' },
        windowType: { pc: 'IFRAME', mobile: 'REDIRECTION' },
        redirectUrl: `${window.location.origin}/credits?amount=${amount}`
      });

      if (response && !response.code) {
        try {
          await api.post('/credits/validate', {
            impUid: response.paymentId,
            merchantUid: paymentId,
            amount: amount
          });
          alert(`${amount.toLocaleString()}C 충전이 완료되었습니다.`);
          fetchData();
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            const data = error.response?.data as ErrorResponse;
            const message = data?.error?.message || '결제 검증 중 오류가 발생했습니다.';
            alert(message);
          } else {
            alert('결제 검증 중 알 수 없는 오류가 발생했습니다.');
          }
        }
      } else if (response && response.code) {
        alert(`결제에 실패하였습니다. (${response.code}) ${response.message}`);
      }
    } catch (e) {
      console.error('Payment request failed:', e);
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  if (!isLoggedIn || role === 'GUEST') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 font-bold text-lg">로그인이 필요한 서비스입니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">내 크레딧 관리</h1>
        <p className="text-slate-500 font-medium text-lg">{nickname}님의 크레딧 현황 및 이용 내역입니다.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-10 mb-12">
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-4">현재 보유 잔액</span>
            <div className="text-6xl font-black text-slate-900 mb-2">
              <span className="text-blue-600">{(creditInfo?.credits || 0).toLocaleString()}</span> <span className="text-3xl text-slate-300">C</span>
            </div>
            <p className="text-slate-500 font-bold">누적 소비액: {(creditInfo?.totalSpentCredits || 0).toLocaleString()} C</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3">
            <button onClick={() => handleRecharge(1000)} className="py-4 bg-blue-50 text-blue-600 border-2 border-blue-100 rounded-2xl font-black cursor-pointer hover:bg-blue-100 transition-all">1,000C</button>
            <button onClick={() => handleRecharge(5000)} className="py-4 bg-blue-100 text-blue-700 border-2 border-blue-200 rounded-2xl font-black cursor-pointer hover:bg-blue-200 transition-all">5,000C</button>
            <button onClick={() => handleRecharge(10000)} className="py-4 bg-blue-600 text-white border-none rounded-2xl font-black cursor-pointer shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">10,000C</button>
            <button onClick={() => handleRecharge(50000)} className="py-4 bg-slate-900 text-white border-none rounded-2xl font-black cursor-pointer shadow-lg hover:bg-black transition-all">50,000C</button>
          </div>
        </section>

        <section className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
          <h3 className="text-xl font-black mb-6">프리미엄 구독 플랜</h3>
          {creditInfo?.plan ? (
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
              <p className="text-blue-400 font-black mb-4">현재 {creditInfo.plan} 구독 중입니다.</p>
              <button onClick={handleUnsubscribe} className="w-full py-3 bg-red-600 text-white border-none rounded-xl font-black cursor-pointer hover:bg-red-700">구독 해지하기</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { label: '주간 (Weekly)', value: 'WEEKLY', price: '3,000 C', desc: 'AI 리뷰 주 10회' },
                { label: '월간 (Monthly)', value: 'MONTHLY', price: '9,900 C', desc: 'AI 리뷰 주 30회' },
                { label: '년간 (Yearly)', value: 'YEARLY', price: '99,000 C', desc: 'AI 리뷰 주 100회' }
              ].map(plan => (
                <button 
                  key={plan.value}
                  onClick={() => handleSubscribe(plan.value)}
                  className="w-full p-5 bg-white/10 rounded-2xl border border-white/10 text-left cursor-pointer hover:bg-white/20 transition-all"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-sm">{plan.label}</span>
                    <span className="font-black text-blue-400">{plan.price}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{plan.desc}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <section>
        <h3 className="text-2xl font-black text-slate-900 mb-6">최근 이용 내역</h3>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">일시</th>
                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">유형</th>
                <th className="px-8 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">금액</th>
                <th className="px-8 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">잔액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">이용 내역이 없습니다.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                        tx.type === 'RECHARGE' ? 'bg-green-50 text-green-600' :
                        tx.type === 'EARN_REVIEW' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {tx.typeDescription}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-right font-black ${
                      tx.amount >= 0 ? 'text-green-600' : 'text-slate-900'
                    }`}>
                      {tx.amount >= 0 ? `+${tx.amount}` : `${tx.amount}`} C
                    </td>
                    <td className="px-8 py-5 text-right text-slate-400 font-bold text-sm">
                      {tx.balanceAfter.toLocaleString()} C
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CreditPage;