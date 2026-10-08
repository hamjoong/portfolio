import React from 'react';

/**
 * 서비스 하단에 위치하는 푸터 컴포넌트입니다.
 * [이유] 기업 정보, 저작권 표시 등 신뢰도를 높이는 
 * 필수적인 정보를 제공하기 위함입니다.
 */
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Hjuk Shopping Mall</h2>
          <p className="text-sm text-gray-500">
            기술로 세상을 더 가깝게, <br />
            가장 혁신적인 이커머스 경험을 제공합니다.
          </p>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Service</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>공지사항</li>
            <li>자주 묻는 질문</li>
            <li>문의하기</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Company</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>회사소개</li>
            <li>인재채용</li>
            <li>이용약관</li>
            <li>개인정보처리방침</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Customer Center</h3>
          <p className="text-xl font-bold text-blue-600">1588-0000</p>
          <p className="text-xs text-gray-400 mt-2">평일 09:00 - 18:00 (주말/공휴일 제외)</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
        Copyright(C) 2026. Hjuk. All right reserved. <br className="md:hidden" />
        본 사이트는 비상업적인 용도로 제작된 포트폴리오 사이트입니다.
      </div>
    </footer>
  );
}
