#!/usr/bin/env bash
# ==============================================================================
# detect-changes.sh
# 목적: 작업 대상 프로젝트 외의 다른 프로젝트나 워크스페이스에
#       원치 않는 변경(오염)이 발생했는지 감지하는 경계 무결성 검증 스크립트.
# 사용법: ./detect-changes.sh <대상프로젝트명>
# ==============================================================================

set -euo pipefail

TARGET_PROJECT="${1:-}"

if [[ -z "$TARGET_PROJECT" ]]; then
  echo "❌ [오류] 대상 프로젝트명을 입력해주세요. (예: ./detect-changes.sh kiosk)"
  exit 1
fi

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$WORKSPACE_ROOT"

echo "🔍 [검증 시작] 대상 프로젝트: [$TARGET_PROJECT] 외 변경 사항 스캔 중..."

VIOLATIONS=0
VIOLATION_FILES=()

# git status -z 옵션으로 NUL 구분자(\0) 처리하여 공백 포함 파일명 완벽 지원
while IFS= read -r -d '' entry; do
  [[ -z "$entry" ]] && continue
  
  # 앞의 상태 코드 2자리와 공백 제거 (예: '?? ', ' M ', 'M  ')
  file="${entry:3}"
  
  # 파일명 변경(rename: R  old -> new) 처리
  if [[ "$entry" =~ ^R ]]; then
    IFS= read -r -d '' newfile || true
    file="$newfile"
  fi

  # 화이트리스트 검사:
  # 1) 대상 프로젝트 경로 (경로 구분자 일치 검증)
  # 2) .Agent 하네스 시스템 폴더
  # 3) 루트 하네스 라우터 (GEMINI.md, AGENTS.md, .gitignore)
  if [[ "$file" == "$TARGET_PROJECT"/* ]] || [[ "$file" == "$TARGET_PROJECT" ]] || \
     [[ "$file" == ".Agent"/* ]] || [[ "$file" == ".Agent" ]] || \
     [[ "$file" == "GEMINI.md" ]] || [[ "$file" == "Gemini_Original.md" ]] || \
     [[ "$file" == "AGENTS.md" ]] || [[ "$file" == ".gitignore" ]]; then
    continue
  fi

  echo "⚠️ [경계 위반 감지] 대상 외 프로젝트/경로의 파일이 변경되었습니다: $file"
  VIOLATIONS=$((VIOLATIONS + 1))
  VIOLATION_FILES+=("$file")
done < <(git status -z)

if [[ $VIOLATIONS -gt 0 ]]; then
  echo "❌ [검증 실패] 총 ${VIOLATIONS}건의 비대상 프로젝트 파일 변경이 감지되었습니다."
  echo "   [위반 파일 목록]"
  for vf in "${VIOLATION_FILES[@]}"; do
    echo "    - $vf"
  done
  echo "작업 대상 프로젝트 격리 원칙에 따라 해당 파일의 의도와 소유자를 확인하십시오."
  exit 1
else
  echo "✅ [검증 성공] 대상 프로젝트 [$TARGET_PROJECT] 외부의 파일 오염이 없습니다. (무결성 통과)"
  exit 0
fi
