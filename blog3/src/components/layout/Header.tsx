import React from 'react';
import { motion } from 'framer-motion';

/**
 * [내비게이션 설계 의도]
 * 사용자가 페이지 내의 핵심 섹션으로 빠르게 이동할 수 있도록 
 * 시각적 위계(Visual Hierarchy)를 고려하여 상단에 고정된 형태의 메뉴를 구성함.
 */
const Header: React.FC = () => {
  return (
    <motion.header 
      /** 
       * 초기 화면 진입 시 상단에서 내려오는 애니메이션을 적용하여 
       * 사이트가 로드되었다는 시각적 피드백을 제공함.
       */
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="header"
    >
      <nav className="header-nav">
        <div className="nav-container">
          <div className="header-logo">Ham Joong Uk</div>
          <ul className="header-links">
            <li><a href="#intro">Introduce</a></li>
            <li><a href="#tech-stack">Tech Stack</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>
      {/* 개발자의 핵심 기술 셋을 메인 제목과 함께 노출하여 첫 화면에서 정체성을 명확히 함 */}
      <div className="header-intro">
        <h1>Developer</h1>
        <p>FrontEnd | BackEnd | DataBase | DevOps | AI Agent</p>
        <p></p>
      </div>
    </motion.header>
  );
};

export default Header;
