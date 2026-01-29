#!/bin/bash
# ═══════════════════════════════════════════════════════════
# SQLite → PostgreSQL 전환 실행 스크립트
# 사용법: bash scripts/execute-migration.sh
# ═══════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_step() { echo -e "\n${BLUE}[STEP]${NC} $1"; }
log_ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_err()  { echo -e "${RED}[ERROR]${NC} $1"; }

echo "═══════════════════════════════════════════════════════════"
echo "  SQLite → PostgreSQL 전환 실행"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ─── Pre-flight Checks ───────────────────────────────────────────
log_step "사전 검사"

# Check .env exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
  log_err ".env 파일이 없습니다."
  exit 1
fi

# Check DATABASE_URL is PostgreSQL
source <(grep DATABASE_URL "$PROJECT_DIR/.env" | head -1)
if [[ "$DATABASE_URL" != postgresql://* ]]; then
  log_err "DATABASE_URL이 PostgreSQL URL이 아닙니다."
  log_err "현재값: $DATABASE_URL"
  echo ""
  echo ".env 파일에 다음과 같이 설정하세요:"
  echo "DATABASE_URL=\"postgresql://unipivot:PASSWORD@localhost:5432/unipivot?schema=public\""
  exit 1
fi
log_ok "DATABASE_URL 확인: PostgreSQL"

# Check schema.prisma provider is postgresql
if ! grep -q 'provider = "postgresql"' "$PROJECT_DIR/prisma/schema.prisma"; then
  log_err "prisma/schema.prisma의 provider가 postgresql이 아닙니다."
  exit 1
fi
log_ok "schema.prisma provider: postgresql"

# Check SQLite backup exists
if [ ! -f "$PROJECT_DIR/prisma/data/unipivot.db.pre-migration" ]; then
  log_warn "SQLite 백업 파일이 없습니다. 지금 생성합니다..."
  cp "$PROJECT_DIR/prisma/data/unipivot.db" "$PROJECT_DIR/prisma/data/unipivot.db.pre-migration"
  log_ok "SQLite 백업 완료"
else
  log_ok "SQLite 백업 확인"
fi

# Check PostgreSQL connection
if ! PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p') \
  psql -h "$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')" \
       -p "$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')" \
       -U "$(echo "$DATABASE_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')" \
       -d "$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')" \
       -c "SELECT 1" > /dev/null 2>&1; then
  log_err "PostgreSQL에 연결할 수 없습니다."
  log_err "URL: $DATABASE_URL"
  echo ""
  echo "다음을 확인하세요:"
  echo "  1. PostgreSQL이 실행 중인지"
  echo "  2. 사용자/비밀번호가 올바른지"
  echo "  3. 데이터베이스가 생성되어 있는지"
  exit 1
fi
log_ok "PostgreSQL 연결 확인"

# Check node/tsx available
if ! command -v npx &> /dev/null; then
  log_err "npx가 설치되어 있지 않습니다."
  exit 1
fi
log_ok "npx 확인"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  모든 사전 검사 통과. 마이그레이션을 시작합니다."
echo "═══════════════════════════════════════════════════════════"
echo ""
read -p "계속하시겠습니까? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "취소되었습니다."
  exit 0
fi

# ─── Step 1: Push Schema to PostgreSQL ────────────────────────────
log_step "1/5 PostgreSQL에 스키마 생성 (prisma db push)"
npx prisma db push --accept-data-loss 2>&1 | tail -5
log_ok "스키마 생성 완료"

# ─── Step 2: Generate Prisma Client ──────────────────────────────
log_step "2/5 Prisma Client 재생성"
npx prisma generate 2>&1 | tail -3
log_ok "Prisma Client 생성 완료"

# ─── Step 3: Run Migration ───────────────────────────────────────
log_step "3/5 데이터 마이그레이션 실행"
npx tsx scripts/migrate-all-to-postgres.ts 2>&1
MIGRATION_EXIT=$?

if [ $MIGRATION_EXIT -ne 0 ]; then
  log_err "마이그레이션 실패! 종료 코드: $MIGRATION_EXIT"
  echo ""
  echo "롤백하려면:"
  echo "  bash scripts/execute-migration.sh --rollback"
  exit 1
fi
log_ok "데이터 마이그레이션 완료"

# ─── Step 4: Verify Migration ────────────────────────────────────
log_step "4/5 데이터 검증"
npx tsx scripts/verify-migration.ts 2>&1
VERIFY_EXIT=$?

if [ $VERIFY_EXIT -ne 0 ]; then
  log_warn "검증에서 일부 불일치가 발견되었습니다."
  echo "scripts/verification-report.json을 확인하세요."
else
  log_ok "데이터 검증 완료 - 모든 항목 통과"
fi

# ─── Step 5: Summary ────────────────────────────────────────────
log_step "5/5 완료"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  마이그레이션 완료!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  다음 단계:"
echo "  1. 앱 재시작: pm2 restart unipivot (또는 pnpm dev)"
echo "  2. 기능 테스트: 인증, 프로그램 CRUD, 검색 등"
echo "  3. 에러 모니터링"
echo ""
echo "  롤백이 필요하면:"
echo "  1. .env의 DATABASE_URL을 SQLite로 변경"
echo "     DATABASE_URL=\"file:./prisma/data/unipivot.db\""
echo "  2. schema.prisma의 provider를 sqlite로 변경"
echo "  3. npx prisma generate && pm2 restart unipivot"
echo ""
