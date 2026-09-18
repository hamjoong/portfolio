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
          <h2 className="section-title">안녕하세요 기술로 가치를 만드는 개발자입니다.</h2>
          {/* 철학 구절을 강조하여 개인의 핵심 개발 모토를 명확히 전달함 */}
          <p className="intro-philosophy">
            &quot;기술은 그 자체로 목적이 아니라 사용자의 문제를 해결하고 경험을 개선하기 위한 도구입니다.&quot;
          </p>
          <div className="intro-description">
            <p>
              제가 개발에서 가장 중요하게 생각하는 것은 <strong>'이 코드가 사용자에게 어떤 실질적인 가치를 전달하는가'</strong>입니다.
              단순히 기능을 구현하는 것을 넘어 기술적 의사결정의 배경에는 항상 사용자 경험을 최적화하기 위한 깊은 고민이 담겨 있습니다.
            </p>
            <p>
              성능 최적화, 인터페이스 개선, 데이터 처리 등 어떤 기술적 과제이든 
              사용자의 불편함을 줄이고 가치를 극대화하는 방향으로 설계합니다.
            </p>
            <p>
              복잡한 비즈니스 로직을 명확하고 지속 가능한 구조로 구현하며
              팀과 함께 더 나은 사용자 경험을 창출하는 협업 문화를 중요하게 생각합니다.
            </p>
          </div>
          <div className="intro-vision">
            <h3>나의 비전</h3>
            <p>
              기술의 장벽을 낮추고 누구나 더 나은 경험을 할 수 있는 서비스를 만드는 것이 저의 목표입니다.
            </p>
            <p>
              현실적인 문제를 기술로 해결하고 그 해결 과정과 가치를 팀원들에게 명확히 설명할 수 있는 개발자로 성장하고 있습니다.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Intro;
