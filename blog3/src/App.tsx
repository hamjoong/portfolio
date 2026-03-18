import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Intro from './components/Intro';
import TechStack from './components/TechStack';
import Projects from './components/Projects';
import Contact from './components/Contact';

/**
 * [스타일 관리 전략]
 * 전역 스타일 변수와 각 컴포넌트별 독립적인 SCSS 파일을 사용하여 
 * 스타일의 재사용성을 높이고 컴포넌트 간의 스타일 간섭을 최소화하기 위해 개별 임포트 방식을 채택함.
 */
import './styles/Header.scss';
import './styles/Intro.scss';
import './styles/TechStack.scss';
import './styles/Projects.scss';
import './styles/Contact.scss';
import './styles/Footer.scss';

/**
 * [컴포넌트 배치 전략]
 * 사용자가 웹사이트를 방문했을 때 '나'에 대한 첫인상을 정의하는 Intro부터 
 * 구체적인 기술(TechStack), 결과물(Projects), 그리고 행동 유도(Contact) 순으로 
 * 논리적인 흐름을 구성하여 사용자 경험(UX)을 최적화함.
 */
const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Intro />
        <TechStack />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
