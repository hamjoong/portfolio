# 프로젝트 경계 수칙 (Project Boundary)

이 문서는 `portfolio` 단일 워크스페이스 내 독립 프로젝트들의 경계 분리 및 격리 원칙을 정의합니다.

---

## 1. 워크스페이스와 프로젝트의 관계

* **단일 워크스페이스 (Single Workspace)**: `portfolio` 디렉터리는 공통 환경이자 상위 컨테이너입니다.
* **단일 하네스 (Single Harness)**: 통제 타워는 워크스페이스 루트의 `.Agent/` 하나뿐입니다.
* **독립 프로젝트 (Independent Units)**:
  - `blog` / `blog2` / `blog3` / `devcodehub` / `kiosk` / `matrixcalculator` / `milktycoon` / `movie` / `notepad` / `shoppingmall` / `ssnvalidation` 등 각 하위 디렉터리는 완전한 독립형 프로젝트입니다.
  - 프로젝트 내부에 별도의 `.Agent/` 폴더를 생성하지 않습니다.

---

## 2. 샌드박스 격리 규칙

1. **상대 경로 참조 금지**:
   - `devcodehub` 프로젝트의 코드에서 `../shoppingmall`이나 `../blog3`의 소스 코드를 import하거나 직접 런타임 참조할 수 없습니다.
2. **패키지 / 의존성 독립성**:
   - 각 프로젝트는 자신의 디렉터리 내에 독립된 `package.json` / `requirements.txt` / `pom.xml` 등을 가지며 / 루트 레벨의 공통 의존성으로 묶이지 않습니다.
3. **읽기/분석과 수정의 명확한 분리**:
   - 워크스페이스 구조 파악, 의존성 비교, 전체 현황 보고를 위한 **타 프로젝트의 파일/디렉터리 조회 및 읽기(Level 0/1)는 전면 허용**됩니다.
   - 단, 파일의 **생성, 수정, 삭제(Level 2)는 오직 사용자가 지정한 단일 대상 프로젝트 내부로 엄격히 제한**됩니다.
4. **변경 격리 검증**:
   - 작업 완료 후 `.Agent/scripts/validate-workspace.sh <대상프로젝트>`를 실행하여 타 프로젝트 파일 오염이 없는지 무결성을 확인합니다.

---