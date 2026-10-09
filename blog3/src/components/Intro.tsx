import React from 'react';
import { m } from 'framer-motion';

/**
 * [섹션 설계 목적]
 * 스킬을 보기 전에 포지션(신입 프론트엔드)과 만든 프로젝트를 먼저 알려
 * 방문자가 어떤 지원자인지 바로 파악하게 하기 위해 구성함.
 * 
 * [framer-motion 활용 이유]
 * 화면 진입 시 자연스러운 시각적 전환(Fade-in & Slide-up)을 제공하여 
 * 정적인 페이지보다 동적이고 생동감 있는 사용자 경험을 창출하고 시선을 끌기 위해 사용함.
 */
const Intro: React.FC = () => {
  return (
    <section id="intro" className="intro">
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="intro-content no-image"
      >
        <div className="intro-text">
          <h2 className="section-title">화면부터 서버까지 직접 만들어 본 프론트엔드 개발자입니다.</h2>
          <div className="intro-description">
            <p>
              React와 Next.js로 화면을 만들고, 필요할 때는 Spring Boot와 Supabase로 서버까지 구현했습니다.
              코드 리뷰 플랫폼, 쇼핑몰, 웹 게임을 기획부터 배포까지 혼자 만들었습니다.
            </p>
            <p>
              동작하는 데서 멈추지 않고 동시 주문 시 재고 문제, 느린 응답, 새로고침 시 데이터 유실 같은 문제를 찾아 고치는 과정을 좋아합니다.
            </p>
            <p>
              지금은 신입 프론트엔드 개발자로 취업을 준비하고 있습니다. AI 에이전트도 개발에 활용하고 있어 팀에서 빠르게 기여할 수 있습니다.
            </p>
          </div>
        </div>
      </m.div>
    </section>
  );
};

export default Intro;
