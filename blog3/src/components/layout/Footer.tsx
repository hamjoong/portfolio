import React from 'react';

/**
 * [푸터 구성 이유]
 * 저작권 정보와 기술 스택 정보를 명시하여 사이트의 신뢰성을 높이고, 
 * 비상업적 용도임을 밝혀 포트폴리오의 목적성을 명확히 하기 위해 작성함.
 */
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Copyright(C) 2026. Hjuk. All right reserved. 본 사이트는 비상업적인 용도로 제작된 포트폴리오 사이트입니다</p>
        <p>Built with React, TypeScript, and SASS.</p>
      </div>
    </footer>
  );
};

export default Footer;
