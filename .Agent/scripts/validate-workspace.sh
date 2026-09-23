#!/usr/bin/env bash
# ==============================================================================
# validate-workspace.sh
# 목적: OpenAI 하네스 엔지니어링의 "기계적 불변성(Mechanical Invariants)" 강제 스크립트.
#       1) 작업 대상 외 타 프로젝트 오염 감지 (공백 및 rename 안전 처리)
#       2) .env 노출 및 Untracked 포함 하드코딩된 Secret/API Key 검출
#       3) Git 상태 및 필수 하네스 핵심 파일 무결성 검증
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
# 1. 대상 외 프로젝트 변경(오염) 감지 (공백 안전 NUL 분리 파싱)
# ------------------------------------------------------------------------------
echo "👉 [1/3] 프로젝트 경계 격리 검증 중..."
if [[ -n "$TARGET_PROJECT" ]]; then
  VIOLATIONS=0
  VIOLATION_FILES=()

  while IFS= read -r -d '' entry; do
    [[ -z "$entry" ]] && continue
    file="${entry:3}"
    if [[ "$entry" =~ ^R ]]; then
      IFS= read -r -d '' newfile || true
      file="$newfile"
    fi

    # detect-changes.sh와 100% 동일한 허용 화이트리스트 적용
    if [[ "$file" == "$TARGET_PROJECT"/* ]] || [[ "$file" == "$TARGET_PROJECT" ]] || \
       [[ "$file" == ".Agent"/* ]] || [[ "$file" == ".Agent" ]] || \
       [[ "$file" == "GEMINI.md" ]] || [[ "$file" == "Gemini_Original.md" ]] || \
       [[ "$file" == "AGENTS.md" ]] || [[ "$file" == ".gitignore" ]]; then
      continue
    fi

    echo "   ⚠️ [경계 위반] 대상 외 프로젝트 파일이 수정/추가됨: $file"
    VIOLATIONS=$((VIOLATIONS + 1))
    VIOLATION_FILES+=("$file")
  done < <(git status -z)

  if [[ $VIOLATIONS -gt 0 ]]; then
    echo "   ❌ [실패] 총 ${VIOLATIONS}건의 비대상 프로젝트 변경이 발견되었습니다."
    for vf in "${VIOLATION_FILES[@]}"; do
      echo "      - $vf"
    done
    FAILED=1
  else
    echo "   ✅ [통과] 대상 프로젝트 [$TARGET_PROJECT] 외부 변경 없음."
  fi
else
  echo "   ℹ️ [스킵] 대상 프로젝트가 지정되지 않아 경계 검사를 건너뜁니다."
fi

# ------------------------------------------------------------------------------
# 2. Secret / API Key / 민감정보 하드코딩 탐지 (추적 및 미추적(Untracked) 파일 포괄 검사)
# ------------------------------------------------------------------------------
echo "👉 [2/3] Zero Trust 비밀정보(Secret) 하드코딩 탐지 중..."
SECRET_PATTERNS="(AIzaSy[0-9A-Za-z_-]{33}|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|AWS_SECRET_ACCESS_KEY|BEGIN PRIVATE KEY)"

# 2-1. git diff(Staged 및 Unstaged) 검사: 추가된 라인(+)만 추출하고 스크립트 자체는 제외
DIFF_OUTPUT=$(git diff --cached -- . ':(exclude).Agent/scripts/validate-workspace.sh' | grep -E "^\+[^\+]" || true)
DIFF_UNCACHED=$(git diff -- . ':(exclude).Agent/scripts/validate-workspace.sh' | grep -E "^\+[^\+]" || true)
COMBINED_DIFF="${DIFF_OUTPUT}${DIFF_UNCACHED}"

SECRET_FOUND=0
if echo "$COMBINED_DIFF" | grep -E -q "$SECRET_PATTERNS"; then
  SECRET_FOUND=1
fi

# 2-2. 미추적(Untracked) 신규 파일 내용까지 포괄 검사
while IFS= read -r -d '' entry; do
  [[ -z "$entry" ]] && continue
  if [[ "$entry" =~ ^\?\? ]]; then
    untracked_file="${entry:3}"
    if [[ -f "$untracked_file" ]]; then
      # 바이너리 파일이 아닌 경우에만 텍스트 grep 실행
      if grep -I -E -q "$SECRET_PATTERNS" "$untracked_file" 2>/dev/null; then
        echo "   ⚠️ [비밀정보 감지] 미추적 신규 파일에서 Secret 패턴 검출: $untracked_file"
        SECRET_FOUND=1
      fi
    fi
  fi
done < <(git status -z)

if [[ $SECRET_FOUND -eq 1 ]]; then
  echo "   ❌ [보안 위반] 하드코딩된 API Key 또는 Private Key 패턴이 변경/신규 파일에서 발견되었습니다!"
  echo "      환경 변수(.env) 또는 Secret Manager를 사용하고 실제 키를 제거하십시오."
  FAILED=1
else
  echo "   ✅ [통과] 하드코딩된 비밀정보 패턴 미검출."
fi

# 2-3. .env 노출 검사 (공백 안전)
ENV_EXPOSED=0
while IFS= read -r -d '' entry; do
  [[ -z "$entry" ]] && continue
  check_file="${entry:3}"
  if [[ "$check_file" == *".env"* ]] && [[ "$check_file" != *".env.example"* ]]; then
    echo "   ⚠️ [노출 감지] .env 파일이 Git 상태에 노출됨: $check_file"
    ENV_EXPOSED=1
  fi
done < <(git status -z)

if [[ $ENV_EXPOSED -eq 1 ]]; then
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
