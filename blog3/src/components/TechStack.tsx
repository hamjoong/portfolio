import React from 'react';
import { motion } from 'framer-motion';

/**
 * [기술 스택 관리 전략]
 * 단순 기술 나열이 아닌 Frontend, Backend, Tools & AI Agent로 카테고리화하여 
 * 개발 프로세스 전반에 걸친 풀스택 역량과 최신 도구(AI) 활용 능력을 효과적으로 보여주기 위해 분류함.
 */
interface TechItemProps {
  name: string;
  description: string;
  icon?: string;
}

/**
 * [TechItem 컴포넌트 분리 이유]
 * 각 기술 항목의 렌더링 로직을 독립시켜 코드의 가독성을 높이고, 
 * 향후 아이콘 추가나 호버 효과 변경 시 모든 항목에 일괄 적용할 수 있는 유지보수 편의성을 확보함.
 */
const TechItem: React.FC<TechItemProps> = ({ name, description }) => (
  <div className="tech-item">
    <div className="tech-item-header">
      <span className="tech-item-name">{name}</span>
    </div>
    <p className="tech-item-desc">{description}</p>
  </div>
);

const TechStack: React.FC = () => {
  /**
   * [데이터 중심 설계]
   * 기술 정보를 컴포넌트 외부 객체로 관리함으로써 비즈니스 로직과 UI를 분리하고, 
   * 향후 CMS 연동이나 데이터 확장에 유연하게 대응하기 위함.
   */
  const stack = {
    frontend: [
      { name: 'Html', description: '웹 페이지의 구조와 내용을 정의하는 마크업 언어' },
      { name: 'Javascript', description: '웹 페이지에 동적 기능을 추가하는 프로그래밍 언어' },
      { name: 'Css/Sass', description: '웹 페이지의 디자인과 레이아웃을 정의하는 스타일 시트 언어 Sass는 CSS의 확장으로 더 나은 유지보수성을 제공하는 전처리기' },
      { name: 'React', description: '컴포넌트 기반의 UI 개발 및 상태 관리 최적화' },
      { name: 'TypeScript', description: '정적 타이핑을 통한 코드 안정성 및 유지보수성 향상' },
      { name: 'Next.js', description: 'SSR/SSG를 통한 성능 최적화 및 SEO 대응 React 기반의 풀스택 웹 프레임워크' },
      { name: 'jQuery', description: 'DOM 조작과 이벤트 처리를 간편하게 해주는 JavaScript 라이브러리' },
      { name: 'JSON', description: '데이터 교환 형식으로 프론트엔드와 백엔드 간의 통신에 사용' },
    ],
    backend: [
      { name: 'Node.js', description: 'Express/NestJS를 이용한 효율적인 API 서버 구축' },
      { name: 'Spring Boot', description: '견고한 비즈니스 로직 및 마이크로서비스 아키텍처 Java 기반의 웹 애플리케이션 프레임워크' },
      { name: 'MySQL/PostgreSQL', description: '데이터 모델링 및 쿼리 최적화' },
      { name: 'Java', description: '객체지향구조를 활용한 애플리케이션의 개발에 활용되는 프로그래밍 언어' }
    ],
    etc: [
      { name: 'Git', description: 'GitHub Flow, Git-flow를 활용한 체계적인 버전 관리 및 협업' },
      { name: 'VS Code', description: '효율적인 코드 작성 및 디버깅을 위한 IDE' },
      { name: 'Antigravity', description: '개인 프로젝트에서 AI Agent로 활용하여 개발 지원 및 자동화 구현 효율적인 코드 작성 및 디버깅을 위한 IDE' },
      { name: 'AI Agent', description: 'AI LLM 기반의 자동화 및 지능형 개발 지원 (Gemini CLI, ChatGPT, Claude사용경험)' },
      { name: 'CI/CD', description: 'GitHub Actions, GitHub Deploy Branch, GitHub Pages를 이용한 빌드 및 배포 자동화' }
    ]
  };

  return (
    <section id="tech-stack" className="tech-stack">
      <motion.div
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
              {stack.frontend.map((item, idx) => (
                <TechItem key={idx} {...item} />
              ))}
            </div>
          </div>

          <div className="tech-category">
            <h3 className="category-title">Backend</h3>
            <div className="tech-list">
              {stack.backend.map((item, idx) => (
                <TechItem key={idx} {...item} />
              ))}
            </div>
          </div>

          <div className="tech-category">
            <h3 className="category-title">Tools & AI Agent</h3>
            <div className="tech-list">
              {stack.etc.map((item, idx) => (
                <TechItem key={idx} {...item} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default TechStack;
