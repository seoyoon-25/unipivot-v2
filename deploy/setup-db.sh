#!/bin/bash
# UniPivot v2.0 데이터베이스 설정 스크립트

set -e

echo "=========================================="
echo "  UniPivot v2.0 Database Setup"
echo "=========================================="

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 프로젝트 디렉토리
PROJECT_DIR="/var/www/unihome-v2"
cd $PROJECT_DIR

# 환경 확인
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env 또는 .env.production 파일이 없습니다.${NC}"
    echo "  .env.example을 복사하여 환경 변수를 설정하세요."
    exit 1
fi

echo -e "${YELLOW}1. Prisma 클라이언트 생성...${NC}"
npx prisma generate

echo -e "${YELLOW}2. 데이터베이스 마이그레이션...${NC}"
# SQLite의 경우
npx prisma db push

# PostgreSQL의 경우 (프로덕션)
# npx prisma migrate deploy

echo -e "${YELLOW}3. 데이터베이스 상태 확인...${NC}"
npx prisma db pull --print

echo -e "${GREEN}=========================================="
echo "  데이터베이스 설정 완료!"
echo "==========================================${NC}"

# 관리자 계정 생성 확인
echo ""
echo -e "${YELLOW}관리자 계정을 생성하시겠습니까? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "관리자 이메일을 입력하세요:"
    read -r admin_email

    echo "관리자 이름을 입력하세요:"
    read -r admin_name

    # Node.js로 관리자 생성
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient();

    async function createAdmin() {
        const password = await bcrypt.hash('admin123!', 12);
        const admin = await prisma.user.upsert({
            where: { email: '${admin_email}' },
            update: {},
            create: {
                email: '${admin_email}',
                name: '${admin_name}',
                password: password,
                role: 'ADMIN'
            }
        });
        console.log('관리자 계정 생성됨:', admin.email);
        await prisma.\$disconnect();
    }
    createAdmin().catch(console.error);
    "

    echo -e "${GREEN}관리자 계정이 생성되었습니다.${NC}"
    echo "  이메일: ${admin_email}"
    echo "  초기 비밀번호: admin123! (반드시 변경하세요!)"
fi
