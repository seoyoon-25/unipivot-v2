const fs = require('fs');
const path = require('path');

// 테스트 이미지 생성 (간단한 1x1 빨간 PNG)
const pngData = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64'
);

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'pages');

// 디렉토리 확인
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 테스트 파일 저장
const timestamp = Date.now();
const filename = `test-${timestamp}.png`;
const filepath = path.join(uploadDir, filename);

fs.writeFileSync(filepath, pngData);

console.log('✅ 테스트 이미지 업로드 시뮬레이션 완료');
console.log('   파일:', filepath);
console.log('   URL: /uploads/pages/' + filename);

// 파일 목록 확인
const files = fs.readdirSync(uploadDir);
console.log('\n📁 업로드 폴더 파일 목록:');
files.forEach(f => console.log('   -', f));
