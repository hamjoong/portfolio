'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { categoryService, Category } from '@/services/category.service';
import { Menu, ChevronRight } from 'lucide-react';

/**
 * 전역 카테고리 메뉴 컴포넌트입니다.
 * [이유] 평상시에는 '전체 카테고리' 버튼만 노출하여 UI를 깔끔하게 유지하고,
 * 호버 및 클릭 시에만 대분류와 중분류가 계층적으로 나타나도록 설계했습니다.
 */
export default function CategoryMenu() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeRootId, setActiveRootId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await categoryService.getCategories();
        if (response.success && response.data && response.data.length > 0) {
          setCategories(response.data);
          setActiveRootId(response.data[0].id);
        } else {
          // 데이터가 없거나 실패한 경우 기본 카테고리 설정 (UI 중단 방지)
          const fallback: Category[] = [
            { 
              id: 1, name: '디지털/가전', displayOrder: 1, children: [
                { id: 4, name: '모바일', children: [], displayOrder: 1 },
                { id: 5, name: '음향기기', children: [], displayOrder: 2 },
                { id: 6, name: 'PC주변기기', children: [], displayOrder: 3 }
              ] 
            },
            { 
              id: 2, name: '패션의류', displayOrder: 2, children: [
                { id: 7, name: '남성유니섹스', children: [], displayOrder: 1 },
                { id: 8, name: '여성의류', children: [], displayOrder: 2 },
                { id: 9, name: '신발', children: [], displayOrder: 3 }
              ] 
            },
            { 
              id: 3, name: '리빙/인테리어', displayOrder: 3, children: [
                { id: 10, name: '가구', children: [], displayOrder: 1 },
                { id: 11, name: '침구', children: [], displayOrder: 2 },
                { id: 12, name: '조명', children: [], displayOrder: 3 }
              ] 
            }
          ];
          setCategories(fallback);
          setActiveRootId(fallback[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // 에러 발생 시에도 빈 화면보다는 기본 메뉴 노출
        const fallback: Category[] = [
          { id: 1, name: '디지털/가전', displayOrder: 1, children: [{ id: 4, name: '모바일', children: [], displayOrder: 1 }] },
          { id: 2, name: '패션의류', displayOrder: 2, children: [{ id: 7, name: '남성유니섹스', children: [], displayOrder: 1 }] },
          { id: 3, name: '리빙/인테리어', displayOrder: 3, children: [{ id: 10, name: '가구', children: [], displayOrder: 1 }] }
        ];
        setCategories(fallback);
        setActiveRootId(fallback[0].id);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 메뉴가 열릴 때마다 첫 번째 항목이 선택되어 있도록 보장
  useEffect(() => {
    if (isMenuOpen && categories.length > 0 && !activeRootId) {
      setActiveRootId(categories[0].id);
    }
  }, [isMenuOpen, categories, activeRootId]);

  const activeCategory = categories.find(c => c.id === activeRootId);

  const handleHotKeywordClick = (keyword: string) => {
    // [개선] window 사용을 제거하고 router.push 만으로 이동. 
    // HomePage의 useSearchParams가 변경을 감지하여 리렌더링함.
    router.push(`/?search=${encodeURIComponent(keyword)}`);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div 
      className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm hidden md:block"
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <div className="container mx-auto px-4 relative h-12 flex items-center">
        {/* 전체 카테고리 트리거 버튼 */}
        <div 
          ref={menuRef}
          className="h-full flex items-center cursor-pointer group"
          onMouseEnter={() => !isLoading && categories.length > 0 && setIsMenuOpen(true)}
        >
          <div 
            onClick={handleTriggerClick}
            className={`flex items-center gap-2 font-black transition-colors h-full ${
              isLoading ? 'text-gray-300 animate-pulse' : 'text-gray-900 group-hover:text-blue-600'
            }`}
          >
            <Menu size={20} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? '카테고리 구성 중...' : '전체 카테고리'}
          </div>

          {/* 서브 메뉴 드롭다운 */}
          {!isLoading && isMenuOpen && categories.length > 0 && (
            <div 
              className="absolute top-full left-0 mt-0 w-[600px] bg-white shadow-2xl border border-gray-100 flex h-[450px] rounded-br-3xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 z-50"
              onMouseEnter={() => setIsMenuOpen(true)}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 대분류 (왼쪽) */}
              <div className="w-1/3 bg-gray-50 border-r border-gray-100 py-4 overflow-y-auto scrollbar-hide">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onMouseEnter={() => setActiveRootId(category.id)}
                    className={`flex items-center justify-between px-6 py-3 text-sm font-bold cursor-pointer transition-all ${
                      activeRootId === category.id 
                        ? 'bg-white text-blue-600 border-y border-gray-100 -mr-[1px]' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>{category.name}</span>
                    <ChevronRight size={14} className={activeRootId === category.id ? 'opacity-100' : 'opacity-0'} />
                  </div>
                ))}
              </div>

              {/* 중분류 (오른쪽) */}
              <div className="w-2/3 p-8 bg-white overflow-y-auto">
                {activeCategory ? (
                  <div>
                    <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                      <h3 className="text-lg font-black text-gray-900">{activeCategory.name}</h3>
                      <Link 
                        href={`/category/${activeCategory.id}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        전체보기
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                      {activeCategory.children && activeCategory.children.length > 0 ? (
                        activeCategory.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.id}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 group/item"
                          >
                            <span className="w-1 h-1 bg-gray-200 rounded-full group-hover/item:bg-blue-600 transition-colors" />
                            {child.name}
                          </Link>
                        ))
                      ) : (
                        <div className="text-sm text-gray-400 font-bold py-10 text-center col-span-2 bg-gray-50 rounded-2xl">
                          하위 카테고리가 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-4">
                    <Menu size={48} className="opacity-20" />
                    <p className="font-bold">카테고리를 선택해주세요.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 바 상단에 항상 노출되는 인기 키워드 (클릭 시 검색 동작) */}
        <div className="ml-10 flex items-center gap-6 text-xs font-bold text-gray-400">
          <span className="text-blue-600">HOT</span>
          {isLoading ? (
            <div className="flex gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 w-16 bg-gray-100 rounded" />
              ))}
            </div>
          ) : (
            [
              '갤럭시 S24',
              '와이드 팬츠',
              '봄 자켓',
              '인테리어 소품'
            ].map((keyword) => (
              <button
                key={keyword}
                onClick={() => handleHotKeywordClick(keyword)}
                className="hover:text-gray-900 transition-colors"
              >
                {keyword}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
