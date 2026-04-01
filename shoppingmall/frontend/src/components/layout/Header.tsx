'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useCart } from '@/hooks/useCart';
import { useSearch } from '@/hooks/useSearch';
import { ShoppingCart, User, Search, LogOut, ShieldCheck } from 'lucide-react';

/**
 * 전역 헤더 컴포넌트입니다.
 * [성능 최적화] 검색 입력에 디바운싱(300ms)을 적용하여 불필요한 API 호출을 방지했습니다.
 */
export default function Header() {
  const { isLoggedIn, logout } = useAuthStore();
  const { useGetCart } = useCart();
  const { data: cartItems } = useGetCart();
  
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // 검색 입력 디바운싱 처리
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [keyword]);

  const { useProductSearch } = useSearch(debouncedKeyword);
  const { data: searchResults } = useProductSearch();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keyword.trim()) {
      saveSearch(keyword);
      if (searchResults && searchResults.length > 0) {
        window.location.href = `/product/${searchResults[0].id}`;
        setKeyword('');
      }
    }
  };

  const handleSearchClick = () => {
    if (keyword.trim()) {
      saveSearch(keyword);
      if (searchResults && searchResults.length > 0) {
        window.location.href = `/product/${searchResults[0].id}`;
        setKeyword('');
      }
    }
  };

  const cartCount = cartItems ? Object.values(cartItems).reduce((a, b) => a + b, 0) : 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-black text-blue-600 shrink-0 tracking-tighter uppercase">
          Hjuk Shopping Mall
        </Link>

        <div className="relative flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="상품 검색 (실시간)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full h-11 pl-11 pr-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
            />
            <Search 
              className="absolute left-4 top-3 text-gray-400 w-5 h-5 cursor-pointer hover:text-blue-500 transition-colors" 
              onClick={handleSearchClick}
            />
          </div>

          {/* 검색 드롭다운 (최근 검색어 또는 검색 결과) */}
          {isSearchFocused && (
            <div className="absolute top-12 left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl py-3 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {!keyword && recentSearches.length > 0 && (
                <>
                  <p className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recent Searches</p>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setKeyword(s); saveSearch(s); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                  <div className="border-t border-gray-50 mt-2 pt-2 px-4">
                    <button onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches'); }} className="text-[10px] text-gray-400 hover:text-red-500">전체 삭제</button>
                  </div>
                </>
              )}

              {keyword && searchResults && searchResults.length > 0 && (
                <>
                  <p className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Search Results</p>
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.id}`}
                      className="flex items-center gap-4 px-4 py-2.5 hover:bg-blue-50 transition-colors"
                      onClick={() => { saveSearch(keyword); setKeyword(''); }}
                    >
                      <div className="relative w-10 h-10 shrink-0">
                        <Image src={item.mainImageUrl || '/placeholder.png'} alt={item.name} fill className="object-cover rounded-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs font-medium text-blue-600">{item.price.toLocaleString()}원</p>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <nav className="flex items-center gap-2">
          <Link href="/cart" className="relative p-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-1">
              {useAuthStore.getState().role === 'ROLE_ADMIN' && (
                <Link href="/admin" className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="어드민 대시보드">
                  <ShieldCheck className="w-6 h-6" />
                </Link>
              )}
              <Link href="/mypage" className="p-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
                <User className="w-6 h-6" />
              </Link>
              <button onClick={logout} className="p-2.5 text-gray-400 hover:text-red-500 rounded-xl transition-all">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-5 py-2.5 bg-gray-900 text-white text-sm font-black rounded-xl hover:bg-black transition-all ml-2 shadow-lg shadow-gray-200">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
