import React from 'react';
import { motion } from 'framer-motion';

/**
 * [섹션 설계 목적]
 * 단순히 스킬을 나열하기 전에, 개발자로서의 가치관과 비전을 먼저 제시함으로써 
 * 방문자에게 본인이 추구하는 기술적 방향성에 대한 신뢰를 주기 위해 구성함.
 * 
 * [framer-motion 활용 이유]
 * 화면 진입 시 자연스러운 시각적 전환(Fade-in & Slide-up)을 제공하여 
 * 정적인 페이지보다 동적이고 생동감 있는 사용자 경험을 창출하고 시선을 끌기 위해 사용함.
 */
const Intro: React.FC = () => {
  return (
    <section id="intro" className="intro">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="intro-content no-image"
      >
        <div className="intro-text">
          <h2 className="section-title">안녕하세요 기술의 본질을 탐구하는 개발자입니다.</h2>
          {/* 철학 구절을 강조하여 개인의 핵심 개발 모토를 명확히 전달함 */}
          <p className="intro-philosophy">
            "좋은 사용자 경험은 결국 좋은 기술적 선택에서 시작된다고 믿습니다."
          </p>
          <div className="intro-description">
            <p>
              단순히 화면을 구현하는 것에서 끝나지 않고
              왜 이 기술을 선택했는지 어떤 문제를 해결하기 위한 구조인지 고민하며 개발합니다.
            </p>
            <p>
              실시간 데이터 처리부터 사용자 경험을 개선하는 인터페이스까지
              작은 기능 하나에도 이 기능이 사용자에게 어떤 가치를 전달할지 먼저 고민합니다.
            </p>
            <p>
              복잡한 문제를 단순하고 명확한 구조로 풀어내는 과정을 즐기며
              팀과 회사가 함께 성장할 수 있는 지속 가능한 코드와 협업 문화를 만드는 것을 중요하게 생각합니다.
            </p>

          </div>
          <div className="intro-vision">
            <h3>나의 비전</h3>
            <p>
              기술을 통해 비효율적인 문제를 해결하고
              누구나 기술의 혜택을 자연스럽게 누릴 수 있는 세상을 만드는 것이 저의 목표입니다.
            </p>
            <p>
              그 과정에서 저는 실제 문제를 해결하는 개발자
              그리고 좋은 기술적 선택을 설명할 수 있는 개발자로 성장하고 싶습니다.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Intro;
