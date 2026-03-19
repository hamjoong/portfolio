# Milk Tycoon (3D Mobile Game)
추억의 피처폰 게임을 새롭게 리메이크 하여 구현하였습니다.
React와 Three.js를 활용하여 구현한 3D 타이쿤 게임 프로젝트입니다. Capacitor를 통해 모바일 환경(Android/iOS)으로의 확장이 가능하도록 설계되었습니다.

# Demo
- [Live Demo (GitHub Pages)](https://hamjoong.github.io/portfolio/milktycoon/)

# Tech Stack
- **Frontend**: React, TypeScript, Vite
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS
- **Mobile Hybrid**: Capacitor (Android/iOS)

# Key Features
- **3D Rendering**: 브라우저 기반의 실시간 3D 그래픽 구현.
- **Game Logic**: 자원 생산, 업그레이드, 경제 시스템 로직 구현.
- **Cross Platform**: 웹과 모바일 환경을 동시에 지원하는 하이브리드 앱 구조.
- **Responsive UI**: 다양한 기기 해상도에 최적화된 게임 UI.

# Existing system issues
- 게임의 서비스 종료로 인하로 인하여 새롭게 만들어 보았습니다 Milk Tycoon에서 게임 로딩 속도가 느리고 사용자 인터페이스가 복잡하여 사용자 경험이 저하되는 문제

# System Improvements
- Milk Tycoon의 게임 로딩 속도를 개선하기 위해 코드 스플리팅과 이미지 최적화를 도입하여 초기 로딩 시간을 40% 이상 단축하고 사용자 인터페이스를 간소화하여 게임 탐색 과정을 직관적으로 재설계
