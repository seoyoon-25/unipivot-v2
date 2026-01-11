#!/bin/bash
# UniPivot v2.0 보안 점검 스크립트

set -e

echo "=========================================="
echo "  UniPivot v2.0 Security Check"
echo "=========================================="

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/var/www/unihome-v2"
cd $PROJECT_DIR

ISSUES=0

echo ""
echo -e "${YELLOW}1. 환경 변수 점검...${NC}"

# .env 파일 권한 확인
if [ -f ".env" ]; then
    PERMS=$(stat -c %a .env 2>/dev/null || stat -f %Lp .env)
    if [ "$PERMS" != "600" ] && [ "$PERMS" != "640" ]; then
        echo -e "${RED}   ⚠ .env 파일 권한이 너무 개방적입니다: $PERMS (600 권장)${NC}"
        ((ISSUES++))
    else
        echo -e "${GREEN}   ✓ .env 파일 권한: $PERMS${NC}"
    fi
fi

# NEXTAUTH_SECRET 확인
if [ -f ".env.production" ]; then
    if grep -q "your-super-secret-key-change-this" .env.production; then
        echo -e "${RED}   ⚠ NEXTAUTH_SECRET이 기본값입니다. 변경하세요!${NC}"
        ((ISSUES++))
    else
        echo -e "${GREEN}   ✓ NEXTAUTH_SECRET이 설정됨${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}2. 민감한 파일 노출 점검...${NC}"

# .env가 .gitignore에 있는지 확인
if [ -f ".gitignore" ]; then
    if grep -q "^\.env" .gitignore; then
        echo -e "${GREEN}   ✓ .env 파일이 .gitignore에 포함됨${NC}"
    else
        echo -e "${RED}   ⚠ .env 파일이 .gitignore에 없습니다!${NC}"
        ((ISSUES++))
    fi
fi

# 데이터베이스 파일 권한
if [ -f "prisma/dev.db" ]; then
    echo -e "${GREEN}   ✓ SQLite 데이터베이스 존재${NC}"
fi

echo ""
echo -e "${YELLOW}3. 의존성 보안 점검...${NC}"

# npm audit
AUDIT_RESULT=$(npm audit --json 2>/dev/null | head -1 || echo '{}')
if echo "$AUDIT_RESULT" | grep -q '"high":[1-9]' || echo "$AUDIT_RESULT" | grep -q '"critical":[1-9]'; then
    echo -e "${RED}   ⚠ 보안 취약점이 발견되었습니다. 'npm audit'를 실행하세요.${NC}"
    ((ISSUES++))
else
    echo -e "${GREEN}   ✓ 심각한 보안 취약점 없음${NC}"
fi

echo ""
echo -e "${YELLOW}4. 파일 권한 점검...${NC}"

# 디렉토리 권한
find . -type d -perm 777 2>/dev/null | head -5 | while read dir; do
    echo -e "${RED}   ⚠ 777 권한 디렉토리: $dir${NC}"
    ((ISSUES++))
done

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✓ 위험한 디렉토리 권한 없음${NC}"
fi

echo ""
echo -e "${YELLOW}5. 코드 보안 점검...${NC}"

# eval 사용 확인
EVAL_COUNT=$(grep -r "eval(" src/ 2>/dev/null | wc -l)
if [ "$EVAL_COUNT" -gt 0 ]; then
    echo -e "${RED}   ⚠ eval() 사용 발견: $EVAL_COUNT 건${NC}"
    ((ISSUES++))
else
    echo -e "${GREEN}   ✓ eval() 사용 없음${NC}"
fi

# dangerouslySetInnerHTML 확인
DANGER_HTML=$(grep -r "dangerouslySetInnerHTML" src/ 2>/dev/null | wc -l)
if [ "$DANGER_HTML" -gt 0 ]; then
    echo -e "${YELLOW}   ℹ dangerouslySetInnerHTML 사용: $DANGER_HTML 건 (XSS 주의)${NC}"
else
    echo -e "${GREEN}   ✓ dangerouslySetInnerHTML 사용 없음${NC}"
fi

echo ""
echo -e "${YELLOW}6. 헤더 보안 점검 (Nginx 설정)...${NC}"

if [ -f "deploy/nginx.conf" ]; then
    if grep -q "X-Frame-Options" deploy/nginx.conf; then
        echo -e "${GREEN}   ✓ X-Frame-Options 헤더 설정됨${NC}"
    else
        echo -e "${YELLOW}   ℹ X-Frame-Options 헤더 설정 필요${NC}"
    fi

    if grep -q "X-Content-Type-Options" deploy/nginx.conf; then
        echo -e "${GREEN}   ✓ X-Content-Type-Options 헤더 설정됨${NC}"
    else
        echo -e "${YELLOW}   ℹ X-Content-Type-Options 헤더 설정 필요${NC}"
    fi

    if grep -q "Strict-Transport-Security" deploy/nginx.conf; then
        echo -e "${GREEN}   ✓ HSTS 헤더 설정됨${NC}"
    else
        echo -e "${YELLOW}   ℹ HSTS 헤더 설정 필요${NC}"
    fi
fi

echo ""
echo "=========================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}  보안 점검 완료: 문제 없음!${NC}"
else
    echo -e "${RED}  보안 점검 완료: $ISSUES 개 이슈 발견${NC}"
fi
echo "=========================================="
echo ""
echo "추가 권장 사항:"
echo "  1. 정기적으로 'npm audit'를 실행하세요"
echo "  2. NEXTAUTH_SECRET은 강력한 랜덤 문자열을 사용하세요"
echo "     생성: openssl rand -base64 32"
echo "  3. 프로덕션에서는 DEBUG 모드를 비활성화하세요"
echo "  4. 정기적으로 데이터베이스를 백업하세요"
echo ""
