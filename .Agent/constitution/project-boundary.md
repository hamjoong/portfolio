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
   - `devcodehub` 프로젝트의 코드에서 `../shoppingmall`이나 `../blog3`의 소스 코드를 import하거나 직접 참조할 수 없습니다.
2. **패키지 / 의존성 독립성**:
   - 각 프로젝트는 자신의 디렉터리 내에 독립된 `package.json` / `requirements.txt` / `pom.xml` 등을 가지며 / 루트 레벨의 공통 의존성으로 묶이지 않습니다.
3. **변경 격리 검증**:
   - 작업 완료 후 `git status`를 점검하여 / 지시받은 대상 프로젝트 외의 타 디렉터리에 수정 / 추가 / 삭제된 파일이 전혀 없는지 확인해야 합니다.

---