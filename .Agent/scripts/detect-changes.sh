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

# git status 결과를 파싱하여 수정/추가된 파일 목록 추출
CHANGED_FILES=$(git status --porcelain | awk '{print $2}')

VIOLATIONS=0

for file in $CHANGED_FILES; do
  # .Agent 폴더 및 대상 프로젝트 경로는 허용
  if [[ "$file" =~ ^$TARGET_PROJECT/ ]] || [[ "$file" =~ ^\.Agent/ ]]; then
    continue
  fi

  echo "⚠️ [경계 위반 감지] 대상 외 프로젝트 파일이 수정되었습니다: $file"
  VIOLATIONS=$((VIOLATIONS + 1))
done

if [[ $VIOLATIONS -gt 0 ]]; then
  echo "❌ [검증 실패] 총 ${VIOLATIONS}건의 비대상 프로젝트 파일 변경이 감지되었습니다."
  echo "작업 대상 프로젝트 격리 원칙에 따라 해당 파일들을 롤백하거나 확인하십시오."
  exit 1
else
  echo "✅ [검증 성공] 대상 프로젝트 [$TARGET_PROJECT] 외부의 파일 오염이 없습니다. (무결성 통과)"
  exit 0
fi
