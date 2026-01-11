# UniPivot v2.0 배포 가이드

## 목차
1. [시스템 요구사항](#시스템-요구사항)
2. [초기 설정](#초기-설정)
3. [배포 방법](#배포-방법)
4. [유지보수](#유지보수)
5. [문제 해결](#문제-해결)

---

## 시스템 요구사항

### 서버 환경
- **OS**: Ubuntu 20.04 LTS 이상
- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **메모리**: 최소 2GB RAM (권장 4GB)
- **디스크**: 최소 10GB

### 필수 소프트웨어
```bash
# Node.js 설치 (nvm 사용 권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# PM2 설치
npm install -g pm2

# Nginx 설치
sudo apt update
sudo apt install nginx

# Certbot (SSL)
sudo apt install certbot python3-certbot-nginx
```

---

## 초기 설정

### 1. 프로젝트 클론
```bash
cd /var/www
git clone https://github.com/unipivot/unihome-v2.git
cd unihome-v2
```

### 2. 환경 변수 설정
```bash
cp .env.example .env.production
nano .env.production
```

**필수 설정:**
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://unipivot.org
DATABASE_URL="file:./prisma/production.db"
NEXTAUTH_URL=https://unipivot.org
NEXTAUTH_SECRET=<생성된_시크릿_키>
```

**시크릿 키 생성:**
```bash
openssl rand -base64 32
```

### 3. 의존성 설치 및 빌드
```bash
npm ci
npm run build
```

### 4. 데이터베이스 설정
```bash
./deploy/setup-db.sh
```

### 5. PM2 설정
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 6. Nginx 설정
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/unipivot.conf
sudo ln -s /etc/nginx/sites-available/unipivot.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL 인증서 (Let's Encrypt)
```bash
sudo certbot --nginx -d unipivot.org -d www.unipivot.org
```

---

## 배포 방법

### 자동 배포
```bash
./deploy/deploy.sh
```

### 수동 배포
```bash
# 1. 코드 업데이트
git pull origin main

# 2. 의존성 설치
npm ci

# 3. Prisma 생성
npx prisma generate

# 4. 빌드
npm run build

# 5. PM2 재시작
pm2 reload unipivot
```

### 배포 옵션
```bash
./deploy/deploy.sh full    # 전체 배포 (기본)
./deploy/deploy.sh build   # 빌드만
./deploy/deploy.sh deps    # 의존성만
./deploy/deploy.sh db      # DB 마이그레이션만
```

---

## 유지보수

### 로그 확인
```bash
# PM2 로그
pm2 logs unipivot

# 실시간 모니터링
pm2 monit

# Nginx 로그
tail -f /var/log/nginx/unipivot-access.log
tail -f /var/log/nginx/unipivot-error.log
```

### 백업
```bash
# 수동 백업
./deploy/backup.sh

# 자동 백업 (crontab)
# 매일 새벽 3시에 백업
0 3 * * * /var/www/unihome-v2/deploy/backup.sh >> /var/log/unipivot-backup.log 2>&1
```

### 보안 점검
```bash
./deploy/security-check.sh
```

### PM2 명령어
```bash
pm2 status          # 상태 확인
pm2 restart unipivot # 재시작
pm2 reload unipivot  # 무중단 재시작
pm2 stop unipivot    # 중지
pm2 delete unipivot  # 삭제
```

---

## 문제 해결

### 503 Service Unavailable
1. PM2 상태 확인: `pm2 status`
2. 로그 확인: `pm2 logs unipivot --lines 100`
3. 포트 확인: `lsof -i :3000`
4. 재시작: `pm2 restart unipivot`

### 빌드 실패
```bash
# 캐시 삭제 후 재빌드
rm -rf .next
rm -rf node_modules
npm ci
npm run build
```

### 데이터베이스 오류
```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 데이터베이스 동기화
npx prisma db push
```

### SSL 인증서 갱신
```bash
# 수동 갱신
sudo certbot renew

# 자동 갱신 확인
sudo certbot renew --dry-run
```

---

## 디렉토리 구조

```
/var/www/unihome-v2/
├── .next/              # 빌드 결과물
├── deploy/             # 배포 스크립트
│   ├── backup.sh
│   ├── deploy.sh
│   ├── nginx.conf
│   ├── security-check.sh
│   └── setup-db.sh
├── prisma/
│   ├── schema.prisma   # 데이터베이스 스키마
│   └── dev.db          # SQLite 데이터베이스
├── public/             # 정적 파일
├── src/                # 소스 코드
├── .env.production     # 환경 변수
├── ecosystem.config.js # PM2 설정
└── package.json
```

---

## 연락처

문제가 발생하면 다음으로 연락하세요:
- Email: admin@unipivot.org
- GitHub Issues: https://github.com/unipivot/unihome-v2/issues
