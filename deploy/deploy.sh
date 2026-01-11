#!/bin/bash
# UniPivot v2.0 배포 스크립트

set -e

echo "=========================================="
echo "  UniPivot v2.0 Deployment"
echo "=========================================="

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 변수 설정
PROJECT_DIR="/var/www/unihome-v2"
BACKUP_DIR="/var/backups/unipivot"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

cd $PROJECT_DIR

# 배포 모드 확인
MODE=${1:-"full"}
echo -e "${YELLOW}배포 모드: $MODE${NC}"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 1. 데이터베이스 백업
echo -e "${YELLOW}1. 데이터베이스 백업...${NC}"
if [ -f "prisma/dev.db" ]; then
    cp prisma/dev.db "$BACKUP_DIR/db_backup_$TIMESTAMP.db"
    echo -e "${GREEN}   백업 완료: $BACKUP_DIR/db_backup_$TIMESTAMP.db${NC}"
fi

# 2. 코드 업데이트 (Git 사용 시)
if [ "$MODE" == "full" ] || [ "$MODE" == "update" ]; then
    echo -e "${YELLOW}2. 코드 업데이트...${NC}"
    if [ -d ".git" ]; then
        git fetch origin
        git pull origin main
    else
        echo "   Git 저장소가 아닙니다. 수동으로 코드를 업데이트하세요."
    fi
fi

# 3. 의존성 설치
if [ "$MODE" == "full" ] || [ "$MODE" == "deps" ]; then
    echo -e "${YELLOW}3. 의존성 설치...${NC}"
    npm ci --production=false
fi

# 4. Prisma 클라이언트 생성
echo -e "${YELLOW}4. Prisma 클라이언트 생성...${NC}"
npx prisma generate

# 5. 데이터베이스 마이그레이션
if [ "$MODE" == "full" ] || [ "$MODE" == "db" ]; then
    echo -e "${YELLOW}5. 데이터베이스 마이그레이션...${NC}"
    npx prisma db push
fi

# 6. 프로덕션 빌드
if [ "$MODE" == "full" ] || [ "$MODE" == "build" ]; then
    echo -e "${YELLOW}6. 프로덕션 빌드...${NC}"
    npm run build
fi

# 7. PM2로 앱 재시작
echo -e "${YELLOW}7. 앱 재시작...${NC}"
if pm2 list | grep -q "unipivot"; then
    pm2 reload ecosystem.config.js --env production
else
    pm2 start ecosystem.config.js --env production
fi
pm2 save

# 8. 상태 확인
echo -e "${YELLOW}8. 상태 확인...${NC}"
sleep 3
pm2 status

# 9. 헬스 체크
echo -e "${YELLOW}9. 헬스 체크...${NC}"
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}   서버 응답: $HTTP_STATUS OK${NC}"
else
    echo -e "${RED}   서버 응답: $HTTP_STATUS - 문제가 발생했을 수 있습니다.${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  배포 완료!"
echo "==========================================${NC}"
echo ""
echo "  URL: https://unipivot.org"
echo "  PM2 로그: pm2 logs unipivot"
echo "  PM2 모니터링: pm2 monit"
echo ""
