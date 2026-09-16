# 환경 및 인프라 명세 (Environment & Infrastructure Specification)

이 문서는 본 하네스가 동작하는 **WSL2 Ubuntu-24.04 터미널 및 Visual Studio Code** 환경의 시스템적 특성과 제약 사항을 정의하여 에이전트가 환경 충돌 없이 안정적으로 명령어를 실행하도록 안내합니다.

---

## 1. 런타임 시스템 프로파일

- **운영체제**: Linux (WSL2 Ubuntu 24.04 LTS / x86_64)
- **호스트 환경**: Windows 11 하위 WSL2 서브시스템
- **IDE**: Visual Studio Code (WSL Remote Extension 환경)
- **에이전트 런타임**: Google Antigravity CLI (`agy`) 연동 환경 (Gemini AI 모델 연동)
- **주요 워크스페이스 마운트 경로**:
  - Linux 경로: `/mnt/d/Program Files/Developer/portfolioproject/portfolio`
  - Windows 드라이브 매핑: `D:\Program Files\Developer\portfolioproject\portfolio`

---

## 2. WSL2 환경에서의 필수 작업 수칙

1. **파일 권한 및 실행 권한(chmod)**:
   - `/mnt/d/`는 Windows NTFS 파일 시스템이 9P / drvfs로 마운트된 영역입니다.
   - 셸 스크립트(`.sh`) 생성 시 `chmod +x` 실행 권한 부여를 명시적으로 수행해야 합니다.
2. **경로 구분자 표준화**:
   - 모든 스크립트 / 코드 / 주석 / 문서의 경로는 POSIX 표준인 슬래시(`/`)를 일관되게 사용합니다.
3. **줄바꿈 코드 (Line Endings)**:
   - 윈도우 CRLF(`\r\n`) 혼입 시 Linux bash 스크립트에서 `\r: command not found` 오류가 발생하므로 / 모든 텍스트 /스크립트는 Linux LF(`\n`) 포맷으로 생성 및 관리합니다.
4. **패키지 관리자 명령 통제**:
   - `apt`, `npm`, `pip` 등의 설치 명령은 **Level 3 작업**으로 분류되며 사용자 사전 승인 없이 실행되지 않습니다.

---