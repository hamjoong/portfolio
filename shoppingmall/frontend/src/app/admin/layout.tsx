'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { adminProductsApi } from '@/utils/adminProductsApi';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  ClipboardList,
  ChevronRight,
  ShieldCheck,
  Home,
  LogOut
} from 'lucide-react';

/**
 * 전역 어드민 레이아웃입니다.
 * [디자인] 세련된 다크 사이드바와 화이트 콘텐츠 영역의 대비를 통해 프리미엄한 느낌을 줍니다.
 * [보안] ROLE_ADMIN 권한이 없는 사용자의 접근을 클라이언트 레벨에서 즉시 차단합니다.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, _hasHydrated, logout } = useAuthStore();
  const [authAdminAllowed, setAuthAdminAllowed] = useState(false);
  const [authAdminChecked, setAuthAdminChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isLoggedIn) {
      router.replace('/');
      return;
    }

    let active = true;
    setAuthAdminChecked(false);
    adminProductsApi.isAdmin().then((allowed) => {
      if (!active) return;
      setAuthAdminAllowed(allowed);
      setAuthAdminChecked(true);
      if (!allowed) router.replace('/');
    }).catch((error) => {
      console.error('[Admin] Auth administrator check failed:', error);
      if (!active) return;
      setAuthAdminAllowed(false);
      setAuthAdminChecked(true);
      router.replace('/');
    });
    return () => { active = false; };
  }, [_hasHydrated, isLoggedIn, router]);

  if (!_hasHydrated || !authAdminChecked || !authAdminAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const navItems = [
      { name: '대시보드 홈', href: '/admin', icon: LayoutDashboard },
      { name: '사용자 관리', href: '/admin/users', icon: Users },
      { name: '상품 관리', href: '/admin/products', icon: ShoppingBag },
      { name: '주문 관리', href: '/admin/orders', icon: ClipboardList },
    ];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* 고정 사이드바 */}
      <aside className="hidden lg:flex w-72 flex-col bg-slate-900 border-r border-slate-800 text-white sticky top-0 h-screen">
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
          <div className="bg-blue-600 p-2 rounded-xl mr-3 shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Admin</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management Console</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Home className="w-4 h-4" />
            쇼핑몰 홈으로 이동
          </Link>
          <button
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 모바일 상단 바 (작은 화면용) */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="font-black text-gray-900 tracking-tighter uppercase uppercase">Admin</span>
          </div>
          <button onClick={() => void logout()} className="p-2 text-gray-400"><LogOut className="w-5 h-5" /></button>
        </header>

        {/* 모바일 내비: 데스크톱 사이드바가 보이지 않는 화면에서 메뉴를 이동할 수 있게 한다 */}
        <nav className="lg:hidden bg-white border-b border-gray-100 flex overflow-x-auto px-2 sticky top-16 z-30">
          {[...navItems, { name: '쇼핑몰 홈', href: '/', icon: Home }].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                  isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
