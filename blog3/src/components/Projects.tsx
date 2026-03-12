import React from 'react';
import { motion } from 'framer-motion';

import { Code2 } from 'lucide-react';

/**
 * [프로젝트 기록 전략]
 * 단순히 결과물(Output)을 나열하는 것이 아니라, 프로젝트 진행 중 마주한 
 * 기술적 문제(Problem)와 이를 해결하기 위한 전략(Solution)을 명시하여 
 * 개발자의 문제 해결 역량과 사고 과정을 보여주기 위해 구성함.
 */
interface ProjectProps {
  title: string;
  period: string;
  description: string;
  stack: string[];
  problem: string;
  solution: string;
  links?: { demo?: string; github?: string };
}

/**
 * [ProjectCard 컴포넌트 설계]
 * 반복되는 프로젝트 카드의 UI를 캡슐화하고, 호버 애니메이션(y축 이동)을 
 * 공통 적용하여 사용자 상호작용에 즉각적인 피드백을 주기 위해 분리함.
 */
const ProjectCard: React.FC<ProjectProps> = ({ title, period, description, stack, problem, solution, links }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="project-card"
  >
    <div className="project-visual-header">
      <Code2 size={40} strokeWidth={1.5} />
    </div>
    <div className="project-info">
      <div className="project-header">
        <h3 className="project-title">{title}</h3>
        <span className="project-period">{period}</span>
      </div>
      <p className="project-description">{description}</p>
      <div className="project-tags">
        {stack.map((tag, idx) => (
          <span key={idx} className="tag">{tag}</span>
        ))}
      </div>
      <div className="project-details">
        {/* 문제 해결 역량을 강조하기 위한 상세 영역 */}
        <div className="detail-item">
          <strong>Problem:</strong>
          <p>{problem}</p>
        </div>
        <div className="detail-item">
          <strong>Solution:</strong>
          <p>{solution}</p>
        </div>
      </div>
      <div className="project-links">
        {links?.demo && <a href={links.demo} className="btn btn-primary btn-sm" target="_blank" rel="noreferrer">Live Demo</a>}
        {links?.github && <a href={links.github} className="btn btn-outline btn-sm" target="_blank" rel="noreferrer">GitHub</a>}
      </div>
    </div>
  </motion.div>
);

const Projects: React.FC = () => {
  const projects: ProjectProps[] = [
      {
      title: 'Milk Tycoon',
      period: '2026.03 - 2026.03',
      description: 'Milk Tycoon은 추억의 게임을 현대적으로 재해석한 게임으로 사용자에게 향수를 불러일으키는 동시에 새로운 재미를 제공하는 게임입니다.',
      stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
      problem: 'Milk Tycoon에서 게임 로딩 속도가 느리고 사용자 인터페이스가 복잡하여 사용자 경험이 저하되는 문제',
      solution: 'Milk Tycoon의 게임 로딩 속도를 개선하기 위해 코드 스플리팅과 이미지 최적화를 도입하여 초기 로딩 시간을 40% 이상 단축하고 사용자 인터페이스를 간소화하여 게임 탐색 과정을 직관적으로 재설계',
      links: { github: 'https://hamjoong.github.io/portfolio/milktycoon/'}, 
    },
      {
      title: 'Kiosk',
      period: '2022.09 - 2022.10',
      description: 'Kiosk시스템은 사용자 친화적인 인터페이스와 빠른 응답성을 제공하여 주문 및 결제 과정을 간소화하는 솔루션입니다.',
      stack: ['Html(Pug)', 'Css(Scss)', 'JavaScript', 'jQuery', 'JSON'],
      problem: 'Kiosk시스템에서 페이지 로딩 속도가 느리고 이미지 최적화가 부족하여 사용자 경험이 저하되는 문제',
      solution: '이미지 최적화 및 비동기 데이터 로딩을 구현하여 페이지 로딩 속도를 50% 이상 개선하고 사용자 인터페이스를 직관적으로 재설계하여 주문 과정의 편의성을 향상',
      links: { github: 'https://github.com/hamjoong/portfolio/tree/main/kiosk'}, 
    },
    {
      title: 'Note Pad',
      period: '2022.08 - 2022.09',
      description: 'Note Pad는 직관적인 인터페이스를 제공하여 사용자들이 효율적으로 아이디어를 기록할수 있도록 지원하는 애플리케이션입니다.',
      stack: ['Html(Pug)', 'Css(Scss)', 'JavaScript', 'jQuery', 'JSONS', 'Node.js', 'mysql'],
      problem: 'Note Pad에서 성능 저하 및 데이터 충돌 문제가 발생하여 노트를 편집할 때 데이터 손실이 발생하는 문제',
      solution: '가볍고 빠르게 동작하는 구조로 애플리케이션을 재구성하고 데이터 충돌 방지를 위해 실시간 동기화 및 버전 관리 시스템을 도입하여 사용자 경험을 크게 향상',
      links: { github: 'https://github.com/hamjoong/portfolio/tree/main/notepad' }
    },
    {
      title: 'Matrix Calculator',
      period: '2022.08 - 2022.08',
      description: '계산기능과 시각화 기능을 결합하여 사용자가 행렬 연산의 결과를 직관적으로 이해할 수 있도록 지원하는 애플리케이션입니다.',
      stack: ['Html(Pug)', 'Css(Scss)', 'JavaScript', 'jQuery'],
      problem: 'Matrix Calculator에서 대규모 행렬 연산 시 렌더링 성능이 저하되어 사용자 경험이 크게 떨어지는 문제',
      solution: '행열 연산 최적화 및 가상 DOM을 활용한 렌더링 방식을 도입하여 성능을 70% 이상 개선하고 사용자 인터페이스를 재설계하여 복잡한 행렬 연산 결과를 시각적으로 명확하게 표현',
      links: { github: 'https://github.com/hamjoong/portfolio/tree/main/matrixcalculator' }
    },
    {
      title: 'Movie Box',
      period: '2022.08 - 2022.08',
      description: '영화 정보를 제공하고 사용자가 영화를 탐색하는 플랫폼입니다.',
      stack: ['Html(Pug)', 'Css(Scss)', 'JavaScript', 'jQuery'], 
      problem: 'Movie Box에서 영화 정보 로딩 속도가 느리고 사용자 인터페이스가 복잡하여 사용자 경험이 저하되는 문제',
      solution: '사용자 인터페이스를 간소화하여 영화 탐색 과정을 직관적으로 재설계',
      links: { github: 'https://github.com/hamjoong/portfolio/tree/main/movie' }
    },
    {
      title: 'Ssn Validation',
      period: '2022.08 - 2022.08',
      description: '주민등록번호 유효성 검증 애플리케이션으로 사용자가 입력한 주민등록번호의 형식과 유효성을 검사하여 올바른 정보를 제공하는 솔루션입니다.',
      stack: ['Html', 'Css(Scss)', 'JavaScript'],
      problem: 'Ssn Validation에서 유효성 검증 로직이 복잡하여 사용자 경험이 저하되는 문제',
      solution: '유효성 검증 로직을 간소화하고 사용자 인터페이스를 개선하여 더 나은 사용자 경험을 제공',
      links: { github: 'https://github.com/hamjoong/portfolio/tree/main/ssnvalidation' }
    }
  ];

  return (
    <section id="projects" className="projects">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid">
          {projects.map((project, idx) => (
            <ProjectCard key={idx} {...project} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Projects;
