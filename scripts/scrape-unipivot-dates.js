#!/usr/bin/env node

/**
 * unipivot.org 프로그램 날짜 스크래핑 스크립트
 *
 * 아임웹 기반 unipivot.org 사이트에서 프로그램 날짜 정보를 스크래핑하여
 * bestcome.org 데이터베이스의 프로그램과 매칭 후 날짜를 업데이트합니다.
 *
 * 사용법:
 *   node scrape-unipivot-dates.js           # 실제 실행
 *   node scrape-unipivot-dates.js --dry-run # 테스트 (DB 업데이트 안 함)
 *   node scrape-unipivot-dates.js --debug   # 디버그 모드 (스크린샷 저장)
 *
 * @requires puppeteer
 * @requires @prisma/client
 */

const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const { findBestMatch, normalize } = require('./string-matcher');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

// 프로젝트 루트의 .env 파일 로드
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Prisma 클라이언트 (새 DB - bestcome.org)
const prisma = new PrismaClient();

// Tesseract worker (재사용을 위해 전역으로 관리)
let tesseractWorker = null;

// ============================================================================
// 설정
// ============================================================================

const CONFIG = {
  // 스크래핑 대상 페이지들 (실제 존재하는 페이지만)
  pages: [
    {
      url: 'https://www.unipivot.org/seminar',
      name: '강연/세미나',
      type: 'seminar'
    },
    {
      url: 'https://www.unipivot.org/program',
      name: '프로그램',
      type: 'program'
    },
    {
      url: 'https://www.unipivot.org/bookclub',
      name: '독서모임',
      type: 'bookclub'
    }
  ],

  // 매칭 임계값 (0.0 ~ 1.0) - 낮춰서 더 많은 매칭 시도
  matchThreshold: 0.65,

  // 페이지 로딩 대기 시간 (ms)
  pageLoadDelay: 4000,

  // 요청 간 딜레이 (ms) - 서버 부하 방지
  requestDelay: 2000,

  // 디버그 스크린샷 저장 경로
  debugDir: path.join(__dirname, 'debug-screenshots'),

  // 페이지네이션 최대 페이지 수
  maxPages: 5
};

// ============================================================================
// 명령줄 옵션 파싱
// ============================================================================

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DEBUG = args.includes('--debug');

if (DRY_RUN) {
  console.log('🔍 DRY RUN 모드: 데이터베이스를 수정하지 않습니다.\n');
}

if (DEBUG) {
  console.log('🐛 DEBUG 모드: 스크린샷을 저장합니다.\n');
  if (!fs.existsSync(CONFIG.debugDir)) {
    fs.mkdirSync(CONFIG.debugDir, { recursive: true });
  }
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 지정된 시간만큼 대기
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 한국어 날짜 문자열을 Date 객체로 파싱
 *
 * 지원 형식:
 * - "2024년 3월 15일"
 * - "2024.03.15"
 * - "2024-03-15"
 * - "24.03.15"
 * - "3월 15일" (현재 연도 가정)
 * - "2024년 3월 15일 ~ 4월 30일" (기간)
 * - "2024.03.15 - 2024.04.30" (기간)
 *
 * @param {string} dateStr - 날짜 문자열
 * @returns {Object} { startDate: Date|null, endDate: Date|null }
 */
function parseKoreanDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { startDate: null, endDate: null };
  }

  const currentYear = new Date().getFullYear();
  let startDate = null;
  let endDate = null;

  // 기간 표시 분리 (~ 또는 - 로 구분)
  const periodSeparators = /\s*[~\-–—]\s*/;
  const parts = dateStr.split(periodSeparators);

  // 날짜 파싱 헬퍼
  const parseDate = (str, referenceYear = currentYear) => {
    if (!str) return null;

    str = str.trim();

    // "2024년 3월 15일" 형식
    let match = str.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일?/);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }

    // "3월 15일" 형식 (연도 없음)
    match = str.match(/(\d{1,2})월\s*(\d{1,2})일?/);
    if (match) {
      return new Date(referenceYear, parseInt(match[1]) - 1, parseInt(match[2]));
    }

    // "2024.03.15" 또는 "2024-03-15" 형식
    match = str.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }

    // "24.03.15" 형식 (2자리 연도)
    match = str.match(/(\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if (match) {
      const year = parseInt(match[1]) + 2000;
      return new Date(year, parseInt(match[2]) - 1, parseInt(match[3]));
    }

    return null;
  };

  if (parts.length >= 2) {
    // 기간인 경우
    startDate = parseDate(parts[0]);
    endDate = parseDate(parts[1], startDate ? startDate.getFullYear() : currentYear);
  } else {
    // 단일 날짜
    startDate = parseDate(parts[0]);
    endDate = startDate; // 종료일은 시작일과 동일
  }

  return { startDate, endDate };
}

/**
 * Date 객체를 읽기 쉬운 문자열로 포맷
 */
function formatDate(date) {
  if (!date) return '없음';
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ============================================================================
// OCR 함수
// ============================================================================

/**
 * Tesseract worker 초기화
 */
async function initOCR() {
  if (!tesseractWorker) {
    console.log('   🔤 OCR 엔진 초기화 중...');
    tesseractWorker = await Tesseract.createWorker('kor+eng', 1, {
      logger: () => {} // 로그 비활성화
    });
  }
  return tesseractWorker;
}

/**
 * Tesseract worker 종료
 */
async function terminateOCR() {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}

/**
 * 이미지에서 날짜 텍스트 추출 (OCR)
 *
 * @param {Buffer|string} imageSource - 이미지 버퍼 또는 URL
 * @returns {string} 추출된 날짜 텍스트
 */
async function extractDateFromImage(imageSource) {
  try {
    const worker = await initOCR();
    const { data: { text } } = await worker.recognize(imageSource);

    if (DEBUG) {
      // OCR 결과 일부 출력 (디버깅용)
      const preview = text.substring(0, 200).replace(/\n/g, ' ');
      console.log(`      📝 OCR 텍스트: ${preview}...`);
    }

    // OCR 텍스트에서 날짜 패턴 찾기
    const datePatterns = [
      // "2024년 12월 28일" - 4자리 연도
      { pattern: /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/, yearLen: 4 },
      // "25년 5월 24일" - 2자리 연도
      { pattern: /(\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/, yearLen: 2 },
      // "일시 : 2022년 10월 23일"
      { pattern: /일시\s*[:\：]?\s*(\d{4})\s*[년.\s]*(\d{1,2})\s*[월.\s]*(\d{1,2})/, yearLen: 4 },
      // "일시 : 25년 10월 23일" (2자리 연도)
      { pattern: /일시\s*[:\：]?\s*(\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})/, yearLen: 2 },
      // "2024.03.15" 또는 "2024-03-15"
      { pattern: /(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/, yearLen: 4 },
      // "24.03.15" 또는 "22. 9. 23" (2자리 연도, 공백 허용)
      { pattern: /(\d{2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/, yearLen: 2 },
      // "모집기간 :~ 22.1.25" 형식
      { pattern: /모집[기간]*\s*[:\：]?\s*~?\s*(\d{2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/, yearLen: 2 },
    ];

    // 먼저 연도가 있는 패턴 시도
    for (const { pattern, yearLen } of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        let year = match[1];
        const month = match[2];
        const day = match[3] || '1';

        // 2자리 연도 처리
        if (yearLen === 2) {
          year = '20' + year;
        }

        const y = parseInt(year);
        const m = parseInt(month);
        const d = parseInt(day);

        // 유효성 검사
        if (y >= 2015 && y <= 2030 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          if (DEBUG) {
            console.log(`      ✅ OCR에서 날짜 발견: ${year}년 ${month}월 ${day}일`);
          }
          return `${year}년 ${month}월 ${day}일`;
        }
      }
    }

    // 연도 없는 날짜 패턴 (월/일만) - 연도 추정 필요
    const noYearPattern = /(\d{1,2})\s*월\s*(\d{1,2})\s*일/;
    const noYearMatch = text.match(noYearPattern);
    if (noYearMatch) {
      const month = parseInt(noYearMatch[1]);
      const day = parseInt(noYearMatch[2]);

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        // 연도 추정: 현재 날짜 기준으로 가장 가까운 과거 날짜로 추정
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // 현재 월보다 3개월 이상 이후면 작년으로 추정
        let guessYear = currentYear;
        if (month > currentMonth + 3) {
          guessYear = currentYear - 1;
        }

        if (DEBUG) {
          console.log(`      ✅ OCR에서 날짜 발견 (연도 추정): ${guessYear}년 ${month}월 ${day}일`);
        }
        return `${guessYear}년 ${month}월 ${day}일`;
      }
    }

    return '';
  } catch (error) {
    if (DEBUG) {
      console.error(`      ⚠️ OCR 오류: ${error.message}`);
    }
    return '';
  }
}

/**
 * 페이지에서 포스터 이미지 URL 찾기
 *
 * @param {Page} page - Puppeteer 페이지 객체
 * @returns {string|null} 포스터 이미지 URL
 */
async function findPosterImage(page) {
  return await page.evaluate(() => {
    // 포스터/배너 이미지를 찾기 위한 셀렉터들
    const selectors = [
      // 본문 내 첫 번째 큰 이미지
      '.board-content img',
      '.post-content img',
      '.content img',
      '[class*="content"] img',
      // 아임웹 특정 셀렉터
      '.widget-board-content img',
      '.editor-content img',
      // 일반적인 본문 이미지
      'article img',
      '.article img',
      'main img'
    ];

    for (const selector of selectors) {
      const images = document.querySelectorAll(selector);
      for (const img of images) {
        // 충분히 큰 이미지만 (포스터일 가능성)
        const width = img.naturalWidth || img.width || 0;
        const height = img.naturalHeight || img.height || 0;

        if (width >= 300 && height >= 200) {
          return img.src;
        }
      }
    }

    return null;
  });
}

// ============================================================================
// 스크래핑 함수
// ============================================================================

/**
 * 아임웹 페이지에서 프로그램 목록 스크래핑
 *
 * @param {Page} page - Puppeteer 페이지 객체
 * @param {Object} pageConfig - 페이지 설정
 * @returns {Array} 프로그램 목록 [{title, url, dateText}, ...]
 */
async function scrapeListPage(page, pageConfig) {
  console.log(`\n📋 ${pageConfig.name} 페이지 스크래핑 중...`);
  console.log(`   URL: ${pageConfig.url}`);

  try {
    await page.goto(pageConfig.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(CONFIG.pageLoadDelay);

    // 404 페이지 체크
    const is404 = await page.evaluate(() => {
      const bodyText = document.body.innerText || '';
      return bodyText.includes('404') && (
        bodyText.includes('Page Not Found') ||
        bodyText.includes('페이지를 찾을 수 없') ||
        bodyText.includes('잘못된')
      );
    });

    if (is404) {
      console.log(`   ⚠️ 페이지가 존재하지 않습니다 (404)`);
      return [];
    }

    if (DEBUG) {
      const screenshotPath = path.join(CONFIG.debugDir, `list-${pageConfig.type}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   📸 스크린샷 저장: ${screenshotPath}`);
    }

    // 아임웹 갤러리/보드 위젯에서 프로그램 목록 추출
    const programs = await page.evaluate(() => {
      const items = [];

      // 아임웹 갤러리/카드 위젯 셀렉터들
      const containerSelectors = [
        // 갤러리 위젯
        '.widget-gallery .gallery-list .item',
        '.gallery-list .gallery-item',
        '.gallery-wrap .item',
        // 보드 위젯
        '.widget-board .board-list .item',
        '.board-list .board-item',
        // 아임웹 공통
        '[class*="gallery"] [class*="item"]',
        '[class*="board"] [class*="item"]',
        // 카드 스타일
        '.card-list .card',
        '.card-wrap .item',
        // 일반 그리드
        '.items-wrap .item',
        '.posts-wrap .post',
        // 아임웹 위젯 ID 패턴
        '[id^="w2"] .item',
        '[id^="w2"] .gallery-item'
      ];

      // 아이템 컨테이너 찾기
      let foundItems = [];
      let usedSelector = '';

      for (const selector of containerSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          foundItems = elements;
          usedSelector = selector;
          break;
        }
      }

      // 아이템이 없으면 링크 기반으로 시도
      if (foundItems.length === 0) {
        // 클릭 가능한 카드/아이템 찾기
        const clickableItems = document.querySelectorAll(
          'a[href*="board_id"], a[href*="view"], [data-link], [onclick*="location"]'
        );

        clickableItems.forEach(el => {
          let url = el.href || el.dataset.link || '';

          // onclick에서 URL 추출
          if (!url && el.onclick) {
            const onclickStr = el.onclick.toString();
            const urlMatch = onclickStr.match(/location.*?['"]([^'"]+)['"]/);
            if (urlMatch) url = urlMatch[1];
          }

          const title = el.innerText?.trim().split('\n')[0] || '';

          if (url && title && title.length > 3) {
            items.push({ title, url, dateText: '' });
          }
        });
      } else {
        // 찾은 아이템에서 정보 추출
        foundItems.forEach((item, idx) => {
          // 링크 찾기 (아임웹은 종종 아이템 자체가 링크)
          let url = '';
          const linkEl = item.querySelector('a') || item.closest('a');

          if (linkEl) {
            url = linkEl.href;
          } else if (item.dataset.link) {
            url = item.dataset.link;
          } else if (item.onclick) {
            const onclickStr = item.onclick.toString();
            const urlMatch = onclickStr.match(/location.*?['"]([^'"]+)['"]/);
            if (urlMatch) url = urlMatch[1];
          }

          // 제목 찾기
          let title = '';
          const titleEl = item.querySelector(
            '.title, [class*="title"], h2, h3, h4, .name, [class*="name"]'
          );
          if (titleEl) {
            title = titleEl.innerText?.trim() || '';
          } else {
            // 첫 번째 텍스트 블록을 제목으로 사용
            title = item.innerText?.trim().split('\n')[0] || '';
          }

          // 날짜 추출
          let dateText = '';
          const dateEl = item.querySelector(
            '.date, [class*="date"], time, [class*="time"], .period'
          );
          if (dateEl) {
            dateText = dateEl.innerText?.trim() || '';
          }

          // 전체 텍스트에서 날짜 패턴 찾기
          if (!dateText) {
            const fullText = item.innerText || '';
            const datePatterns = [
              /\d{4}[년.\-/]\s*\d{1,2}[월.\-/]\s*\d{1,2}[일]?/,
              /\d{2}[.\-/]\d{2}[.\-/]\d{2}/,
              /\d{1,2}월\s*\d{1,2}일/
            ];
            for (const pattern of datePatterns) {
              const match = fullText.match(pattern);
              if (match) {
                dateText = match[0];
                break;
              }
            }
          }

          if (title && title.length > 2) {
            items.push({
              title: title.substring(0, 100), // 제목 길이 제한
              url,
              dateText
            });
          }
        });
      }

      return items;
    });

    console.log(`   ✅ ${programs.length}개 프로그램 발견`);

    // 프로그램 목록 미리보기 출력
    if (DEBUG && programs.length > 0) {
      console.log('   📝 발견된 프로그램:');
      programs.slice(0, 5).forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.title.substring(0, 40)}...`);
      });
      if (programs.length > 5) {
        console.log(`      ... 외 ${programs.length - 5}개`);
      }
    }

    // 중복 제거
    const uniquePrograms = [];
    const seenTitles = new Set();
    for (const prog of programs) {
      const normalizedTitle = normalize(prog.title);
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniquePrograms.push(prog);
      }
    }

    return uniquePrograms;
  } catch (error) {
    console.error(`   ❌ 오류: ${error.message}`);
    return [];
  }
}

/**
 * 프로그램 상세 페이지에서 날짜 정보 추출
 *
 * @param {Page} page - Puppeteer 페이지 객체
 * @param {Object} program - 프로그램 정보 {title, url}
 * @returns {Object} {title, startDate, endDate}
 */
async function scrapeDetailPage(page, program) {
  if (!program.url) {
    return { title: program.title, startDate: null, endDate: null };
  }

  try {
    await page.goto(program.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(CONFIG.requestDelay);

    if (DEBUG) {
      const filename = `detail-${normalize(program.title).substring(0, 30).replace(/\s/g, '_')}.png`;
      const screenshotPath = path.join(CONFIG.debugDir, filename);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    // 상세 페이지에서 날짜 정보 추출
    const dateInfo = await page.evaluate(() => {
      const pageText = document.body.innerText || '';

      // 4자리 연도 날짜 패턴들 (우선순위 순)
      const datePatterns4Year = [
        // "일시 : 2022년 10월 23일" 또는 "일시: 2022. 10. 23"
        /일시\s*[:\：]\s*(\d{4})\s*[년.\s]*(\d{1,2})\s*[월.\s]*(\d{1,2})\s*[일]?/,
        // "기간 : 2025.01.15"
        /기간\s*[:\：]\s*(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/,
        // "일정 : 2024년 3월 15일"
        /일정\s*[:\：]\s*(\d{4})\s*[년.\s]*(\d{1,2})\s*[월.\s]*(\d{1,2})\s*[일]?/,
        // "날짜 : 2024.03.15"
        /날짜\s*[:\：]\s*(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/,
        // "시작 : 2024년 3월 15일"
        /시작\s*[:\：]\s*(\d{4})\s*[년.\s]*(\d{1,2})\s*[월.\s]*(\d{1,2})?/,
        // "모집기간 : 2024년 3월"
        /모집\s*[:\：]?\s*(\d{4})\s*[년.\s]*(\d{1,2})\s*[월.\s]*(\d{1,2})?/,
        // "2024년 3월 15일" (일반 패턴)
        /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/,
        // "2024. 3. 15" 또는 "2024.03.15"
        /(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/,
      ];

      // 2자리 연도 날짜 패턴들
      const datePatterns2Year = [
        // "일시 : 22년 10월 23일"
        /일시\s*[:\：]\s*(\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*[일]?/,
        // "22년 10월 23일" (일반 패턴)
        /(\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/,
        // "모집기간 :~ 22.1.25" 또는 "모집기간 : 22. 9. 23"
        /모집[기간]*\s*[:\：]?\s*~?\s*(\d{2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/,
        // "22. 9. 23" 또는 "22.9.23" (공백 허용)
        /(\d{2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/,
      ];

      // 4자리 연도 패턴으로 먼저 검색
      for (const pattern of datePatterns4Year) {
        const match = pageText.match(pattern);
        if (match) {
          const year = match[1];
          const month = match[2];
          const day = match[3] || '1';
          return `${year}년 ${month}월 ${day}일`;
        }
      }

      // 2자리 연도 패턴으로 검색
      for (const pattern of datePatterns2Year) {
        const match = pageText.match(pattern);
        if (match) {
          const year = '20' + match[1]; // 2자리 연도를 4자리로 변환
          const month = match[2];
          const day = match[3] || '1';

          // 유효성 검사
          const y = parseInt(year);
          const m = parseInt(month);
          const d = parseInt(day);
          if (y >= 2015 && y <= 2030 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
            return `${year}년 ${month}월 ${day}일`;
          }
        }
      }

      // 기간 형식 찾기 (예: "2025.01.15 ~ 03.12")
      const periodPattern = /(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\s*[~\-–]/;
      const periodMatch = pageText.match(periodPattern);
      if (periodMatch) {
        return `${periodMatch[1]}년 ${periodMatch[2]}월 ${periodMatch[3]}일`;
      }

      // 2자리 연도 기간 형식 (예: "22.01.15 ~ 03.12")
      const periodPattern2Year = /(\d{2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\s*[~\-–]/;
      const periodMatch2Year = pageText.match(periodPattern2Year);
      if (periodMatch2Year) {
        const y = parseInt('20' + periodMatch2Year[1]);
        const m = parseInt(periodMatch2Year[2]);
        const d = parseInt(periodMatch2Year[3]);
        if (y >= 2015 && y <= 2030 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `20${periodMatch2Year[1]}년 ${periodMatch2Year[2]}월 ${periodMatch2Year[3]}일`;
        }
      }

      // 제목에서 날짜 패턴 찾기 (예: "10월 18일") - 본문 앞부분에서만
      const titleText = pageText.substring(0, 300);
      const titleDatePattern = /(\d{1,2})\s*월\s*(\d{1,2})\s*일/;
      const titleMatch = titleText.match(titleDatePattern);
      if (titleMatch) {
        const month = parseInt(titleMatch[1]);
        const day = parseInt(titleMatch[2]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          // 연도 추정
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth() + 1;
          // 현재 월보다 많이 크면 지난해로 추정
          const guessYear = month > currentMonth + 3 ? currentYear - 1 : currentYear;
          return `${guessYear}년 ${month}월 ${day}일`;
        }
      }

      return '';
    });

    let finalDateInfo = dateInfo;
    let source = 'text';

    // 텍스트에서 날짜를 못 찾았으면 OCR 시도
    if (!dateInfo) {
      const posterUrl = await findPosterImage(page);
      if (posterUrl) {
        if (DEBUG) {
          console.log(`      🖼️ 포스터 이미지 OCR 시도: ${posterUrl.substring(0, 50)}...`);
        }
        const ocrDate = await extractDateFromImage(posterUrl);
        if (ocrDate) {
          finalDateInfo = ocrDate;
          source = 'ocr';
        }
      }
    }

    const parsed = parseKoreanDate(finalDateInfo);

    if (DEBUG && finalDateInfo) {
      console.log(`      📅 추출된 날짜 (${source}): ${finalDateInfo}`);
    }

    return {
      title: program.title,
      url: program.url,
      rawDateText: finalDateInfo,
      source,
      ...parsed
    };
  } catch (error) {
    console.error(`   ⚠️ 상세 페이지 오류 (${program.title}): ${error.message}`);
    return { title: program.title, startDate: null, endDate: null };
  }
}

// ============================================================================
// 메인 실행 함수
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log(' unipivot.org → bestcome.org 프로그램 날짜 동기화');
  console.log('='.repeat(60));
  console.log();

  let browser;

  try {
    // 1. 브라우저 시작
    console.log('🌐 Puppeteer 브라우저 시작 중...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // 사용자 에이전트 설정 (봇 감지 우회)
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // 뷰포트 설정
    await page.setViewport({ width: 1920, height: 1080 });

    // 2. bestcome.org DB에서 기존 프로그램 목록 조회
    console.log('\n📚 bestcome.org 프로그램 목록 조회 중...');
    const existingPrograms = await prisma.program.findMany({
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`   ✅ ${existingPrograms.length}개 프로그램 조회됨`);

    // 날짜가 없는 프로그램 수 확인
    const programsWithoutDate = existingPrograms.filter(p => !p.startDate);
    console.log(`   📅 날짜 없는 프로그램: ${programsWithoutDate.length}개`);

    // 3. 각 페이지에서 프로그램 스크래핑
    const allScrapedPrograms = [];

    for (const pageConfig of CONFIG.pages) {
      // 목록 페이지에서 프로그램 수집
      const programs = await scrapeListPage(page, pageConfig);

      if (programs.length > 0) {
        // 상세 페이지에서 날짜 추출 (목록에서 날짜를 못 가져온 경우)
        for (const prog of programs) {
          if (!prog.dateText && prog.url) {
            console.log(`   🔍 상세 페이지 확인: ${prog.title.substring(0, 30)}...`);
            const detailed = await scrapeDetailPage(page, prog);
            prog.startDate = detailed.startDate;
            prog.endDate = detailed.endDate;
            prog.rawDateText = detailed.rawDateText;
          } else if (prog.dateText) {
            // 목록에서 가져온 날짜 파싱
            const parsed = parseKoreanDate(prog.dateText);
            prog.startDate = parsed.startDate;
            prog.endDate = parsed.endDate;
          }

          allScrapedPrograms.push({
            ...prog,
            source: pageConfig.name
          });

          await sleep(500); // 짧은 딜레이
        }
      }
    }

    // 4. 매칭 및 업데이트
    console.log('\n' + '='.repeat(60));
    console.log(' 매칭 결과');
    console.log('='.repeat(60));

    const matchResults = {
      matched: [],
      unmatched: [],
      noDate: [],
      updated: 0
    };

    for (const scraped of allScrapedPrograms) {
      // 날짜가 없는 경우 스킵
      if (!scraped.startDate) {
        matchResults.noDate.push(scraped);
        continue;
      }

      // 기존 프로그램과 매칭
      const match = findBestMatch(
        { title: scraped.title },
        existingPrograms,
        CONFIG.matchThreshold
      );

      if (match) {
        const existingProg = match.program;
        const needsUpdate = !existingProg.startDate;

        matchResults.matched.push({
          scraped,
          existing: existingProg,
          score: match.score,
          needsUpdate
        });

        if (needsUpdate) {
          console.log(`\n✅ 매칭됨 (${(match.score * 100).toFixed(0)}%):`);
          console.log(`   원본: ${scraped.title}`);
          console.log(`   대상: ${existingProg.title}`);
          console.log(`   날짜: ${formatDate(scraped.startDate)} ~ ${formatDate(scraped.endDate)}`);

          if (!DRY_RUN) {
            // DB 업데이트
            await prisma.program.update({
              where: { id: existingProg.id },
              data: {
                startDate: scraped.startDate,
                endDate: scraped.endDate || scraped.startDate
              }
            });
            console.log(`   💾 DB 업데이트 완료`);
            matchResults.updated++;
          } else {
            console.log(`   ⏸️ DRY RUN - 업데이트 스킵`);
          }
        }
      } else {
        matchResults.unmatched.push(scraped);
      }
    }

    // 5. 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log(' 요약');
    console.log('='.repeat(60));
    console.log(`   📊 스크래핑된 프로그램: ${allScrapedPrograms.length}개`);
    console.log(`   ✅ 매칭 성공: ${matchResults.matched.length}개`);
    console.log(`   ❌ 매칭 실패: ${matchResults.unmatched.length}개`);
    console.log(`   📅 날짜 없음: ${matchResults.noDate.length}개`);
    console.log(`   💾 업데이트됨: ${matchResults.updated}개`);

    // 매칭 실패 목록 출력
    if (matchResults.unmatched.length > 0) {
      console.log('\n📋 매칭 실패 프로그램:');
      for (const prog of matchResults.unmatched) {
        console.log(`   - ${prog.title}`);
        console.log(`     날짜: ${formatDate(prog.startDate)}`);
      }
    }

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    if (DEBUG) {
      console.error(error.stack);
    }
  } finally {
    // 리소스 정리
    if (browser) {
      await browser.close();
      console.log('\n🌐 브라우저 종료');
    }
    await terminateOCR();
    await prisma.$disconnect();
  }

  console.log('\n✨ 완료!');
}

// 스크립트 실행
main().catch(console.error);
