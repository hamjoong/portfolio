'use client';

import React, { useEffect, useState } from 'react';
import { adminProductsApi } from '@/utils/adminProductsApi';
import { AdminUserResponse } from '@/types/auth';
import { Page } from '@/types/common';
import { User, Mail, Shield, Calendar, Activity } from 'lucide-react';

/**
 * 신규 Auth 사용자의 최소 계정 정보를 조회합니다.
 */
export default function AdminUsersPage() {
  const [usersPage, setUsersPage] = useState<Page<AdminUserResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPage = await adminProductsApi.getUsers(page, 50);
        setUsersPage(fetchedPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : '사용자 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 uppercase">User Management</h1>
          <p className="text-gray-500 font-medium">신규 Auth 계정의 기본 정보와 관리자 권한 상태를 조회합니다.</p>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">기본 정보</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">권한 / 상태</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">기록</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usersPage?.content.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                            {user.fullName ? user.fullName[0] : <User className="w-4 h-4" />}
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 mb-0.5">{user.fullName || '이름 미설정'}</p>
                            <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {user.email}
                            </p>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black w-fit uppercase ${
                            user.role === 'ROLE_ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                            <Shield className="w-3 h-3" /> {user.role.replace('ROLE_', '')}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black w-fit uppercase ${
                            user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                            <Activity className="w-3 h-3" /> {user.status}
                        </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="space-y-1 inline-block text-left">
                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> 가입: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] font-bold text-blue-500 flex items-center gap-1.5">
                            <Activity className="w-3 h-3" /> 로그인: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '없음'}
                        </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {usersPage?.content.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No users found</p>
          </div>
        )}
      </div>
      {usersPage && usersPage.totalPages > 1 && (
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40"
            disabled={page === 0 || loading}
            onClick={() => setPage((current) => current - 1)}
          >
            이전
          </button>
          <span className="text-sm font-bold text-gray-500">
            {usersPage.number + 1} / {usersPage.totalPages}
          </span>
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40"
            disabled={usersPage.last || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
