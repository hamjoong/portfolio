import React from 'react';
import { m } from 'framer-motion';
import { TECH_STACK, TechItem as TechItemData } from '../constants/techStack';

/**
 * [기술 스택 관리 전략]
 * 단순 기술 나열이 아닌 Frontend, Backend, Tools로 분류하여
 * 프론트엔드 중심에 서버 구현 경험이 더해진 역량을 보여주기 위함.
 */

/**
 * [TechItem 컴포넌트 분리 이유]
 * 각 기술 항목의 렌더링 로직을 독립시켜 코드의 가독성을 높이고, 
 * 향후 아이콘 추가나 호버 효과 변경 시 모든 항목에 일괄 적용할 수 있는 유지보수 편의성을 확보함.
 */
const TechItem: React.FC<TechItemData> = ({ name, description }) => (
  <div className="tech-item">
    <div className="tech-item-header">
      <span className="tech-item-name">{name}</span>
    </div>
    <p className="tech-item-desc">{description}</p>
  </div>
);

const TechStack: React.FC = () => {
  return (
    <section id="tech-stack" className="tech-stack">
      <m.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">Skills</h2>
        
        <div className="tech-stack-container">
          <div className="tech-category">
            <h3 className="category-title">Frontend</h3>
            <div className="tech-list">
              {TECH_STACK.FrontEnd.map((item, idx) => (
                <TechItem key={idx} {...item} />
              ))}
            </div>
          </div>

          <div className="tech-category">
            <h3 className="category-title">Backend</h3>
            <div className="tech-list">
              {TECH_STACK.BackEnd.map((item, idx) => (
                <TechItem key={idx} {...item} />
              ))}
            </div>
          </div>

          <div className="tech-category">
            <h3 className="category-title">Tools</h3>
            <div className="tech-list">
              {TECH_STACK.ETC.map((item, idx) => (
                <TechItem key={idx} {...item} />
              ))}
            </div>
          </div>
        </div>
      </m.div>
    </section>
  );
};

export default TechStack;

