#!/bin/bash
# UniPivot v2.0 백업 스크립트

set -e

echo "=========================================="
echo "  UniPivot v2.0 Backup"
echo "=========================================="

# 변수 설정
PROJECT_DIR="/var/www/unihome-v2"
BACKUP_DIR="/var/backups/unipivot"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

cd $PROJECT_DIR

echo -e "${YELLOW}1. 데이터베이스 백업...${NC}"
if [ -f "prisma/dev.db" ]; then
    cp prisma/dev.db "$BACKUP_DIR/db_$TIMESTAMP.db"
    gzip "$BACKUP_DIR/db_$TIMESTAMP.db"
    echo -e "${GREEN}   완료: db_$TIMESTAMP.db.gz${NC}"
fi

echo -e "${YELLOW}2. 환경 설정 백업...${NC}"
if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/env_$TIMESTAMP.bak"
    echo -e "${GREEN}   완료: env_$TIMESTAMP.bak${NC}"
fi

echo -e "${YELLOW}3. 업로드 파일 백업...${NC}"
if [ -d "public/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" public/uploads
    echo -e "${GREEN}   완료: uploads_$TIMESTAMP.tar.gz${NC}"
fi

echo -e "${YELLOW}4. 오래된 백업 정리 (${RETENTION_DAYS}일 이상)...${NC}"
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}   완료${NC}"

echo -e "${YELLOW}5. 백업 목록...${NC}"
ls -lh $BACKUP_DIR | tail -10

echo ""
echo -e "${GREEN}=========================================="
echo "  백업 완료!"
echo "==========================================${NC}"
echo "  백업 위치: $BACKUP_DIR"
