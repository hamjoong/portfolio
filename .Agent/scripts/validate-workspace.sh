#!/usr/bin/env bash
# ==============================================================================
# validate-workspace.sh
# 목적: OpenAI 하네스 엔지니어링의 "기계적 불변성(Mechanical Invariants)" 강제 스크립트.
#       1) 작업 대상 외 타 프로젝트 오염 감지
#       2) .env 커밋 및 하드코딩된 Secret/API Key 검출
#       3) Git 상태 무결성 검증
# 사용법: ./validate-workspace.sh [대상프로젝트명]
# ==============================================================================

set -euo pipefail

TARGET_PROJECT="${1:-}"
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$WORKSPACE_ROOT"

echo "=================================================================="
echo "🛡️ [하네스 기계적 무결성 검증 시작 (Harness Invariant Validator)]"
echo "=================================================================="

FAILED=0

# ------------------------------------------------------------------------------
# 1. 대상 외 프로젝트 변경(오염) 감지
# ------------------------------------------------------------------------------
echo "👉 [1/3] 프로젝트 경계 격리 검증 중..."
if [[ -n "$TARGET_PROJECT" ]]; then
  CHANGED_FILES=$(git status --porcelain | awk '{print $2}')
  VIOLATIONS=0
  for file in $CHANGED_FILES; do
    if [[ "$file" =~ ^$TARGET_PROJECT/ ]] || [[ "$file" =~ ^\.Agent/ ]] || [[ "$file" == "GEMINI.md" ]]; then
      continue
    fi
    echo "   ⚠️ [경계 위반] 대상 외 프로젝트 파일이 수정됨: $file"
    VIOLATIONS=$((VIOLATIONS + 1))
  done

  if [[ $VIOLATIONS -gt 0 ]]; then
    echo "   ❌ [실패] 총 ${VIOLATIONS}건의 비대상 프로젝트 변경이 발견되었습니다."
    FAILED=1
  else
    echo "   ✅ [통과] 대상 프로젝트 [$TARGET_PROJECT] 외부 변경 없음."
  fi
else
  echo "   ℹ️ [스킵] 대상 프로젝트가 지정되지 않아 경계 검사를 건너뜁니다."
fi

# ------------------------------------------------------------------------------
# 2. Secret / API Key / 민감정보 하드코딩 탐지 (Zero Trust 검증)
# ------------------------------------------------------------------------------
echo "👉 [2/3] Zero Trust 비밀정보(Secret) 하드코딩 탐지 중..."
SECRET_PATTERNS="(AIzaSy|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|AWS_SECRET_ACCESS_KEY|BEGIN PRIVATE KEY)"

# git에 변경된 파일들 중 민감 정보 검출
DIFF_OUTPUT=$(git diff --cached || true)
DIFF_UNCACHED=$(git diff || true)
COMBINED_DIFF="${DIFF_OUTPUT}${DIFF_UNCACHED}"

if echo "$COMBINED_DIFF" | grep -E -q "$SECRET_PATTERNS"; then
  echo "   ❌ [보안 위반] 하드코딩된 API Key 또는 Private Key 패턴이 변경사항에서 발견되었습니다!"
  echo "      환경 변수(.env) 또는 Secret Manager를 사용하고 실제 키를 제거하십시오."
  FAILED=1
else
  echo "   ✅ [통과] 하드코딩된 비밀정보 패턴 미검출."
fi

# .env 파일이 git status에 untracked 또는 staged 상태로 노출되었는지 확인
if git status --porcelain | grep -E -q "(\.env|\.env\.local)$"; then
  echo "   ❌ [보안 위반] .env 파일이 Git 추적 대상에 노출되어 있습니다. .gitignore에 추가하십시오."
  FAILED=1
else
  echo "   ✅ [통과] .env 파일 노출 없음."
fi

# ------------------------------------------------------------------------------
# 3. 하네스 필수 파일 무결성 점검
# ------------------------------------------------------------------------------
echo "👉 [3/3] 하네스 핵심 헌장 및 정책 무결성 확인 중..."
REQUIRED_FILES=(
  ".Agent/AGENTS.md"
  ".Agent/constitution/core-principles.md"
  ".Agent/constitution/authority-and-priority.md"
  ".Agent/constitution/safety-rules.md"
  ".Agent/policies/git-policy.md"
  ".Agent/policies/comment-policy.md"
  "GEMINI.md"
)

MISSING_COUNT=0
for req in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$req" ]]; then
    echo "   ⚠️ [누락] 필수 하네스 파일 부재: $req"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done

if [[ $MISSING_COUNT -gt 0 ]]; then
  echo "   ❌ [실패] 필수 하네스 파일이 누락되었습니다."
  FAILED=1
else
  echo "   ✅ [통과] 하네스 핵심 헌장 및 정책 정상 보존됨."
fi

echo "=================================================================="
if [[ $FAILED -eq 1 ]]; then
  echo "❌ [검증 결과: 실패] 기계적 불변성 위반이 감지되었습니다. 위 오류를 해결하십시오."
  exit 1
else
  echo "🎉 [검증 결과: 성공] 모든 기계적 하네스 검증을 100% 통과하였습니다!"
  exit 0
fi
