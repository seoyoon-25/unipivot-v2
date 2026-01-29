/**
 * 문자열 매칭 유틸리티
 *
 * 이 모듈은 프로그램 제목을 비교하여 자동으로 매칭하는 기능을 제공합니다.
 * Levenshtein distance 알고리즘을 사용하여 문자열 유사도를 계산합니다.
 *
 * 사용법:
 *   const { normalize, similarity, matchPrograms } = require('./string-matcher');
 *
 * @module string-matcher
 * @author Claude Code
 * @version 1.0.0
 */

// ============================================================================
// 문자열 정규화
// ============================================================================

/**
 * 문자열을 정규화합니다.
 *
 * 비교 전에 문자열을 정규화하여 일관된 비교가 가능하도록 합니다.
 * - 앞뒤 공백 제거
 * - 소문자 변환
 * - 연속된 공백을 단일 공백으로
 * - 특수문자 제거 (단, 한글과 영숫자는 유지)
 *
 * @param {string} str - 정규화할 문자열
 * @returns {string} 정규화된 문자열
 *
 * @example
 * normalize('  [시즌1] 남북한걸음 독서모임  ')
 * // 결과: '시즌1 남북한걸음 독서모임'
 */
function normalize(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .trim()                                           // 앞뒤 공백 제거
    .toLowerCase()                                    // 소문자 변환
    .replace(/\s+/g, ' ')                            // 연속 공백 → 단일 공백
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣0-9]/g, ' ')       // 특수문자 → 공백
    .replace(/\s+/g, ' ')                            // 다시 연속 공백 정리
    .trim();                                          // 최종 공백 제거
}

// ============================================================================
// Levenshtein Distance (편집 거리)
// ============================================================================

/**
 * 두 문자열 사이의 Levenshtein distance를 계산합니다.
 *
 * Levenshtein distance는 한 문자열을 다른 문자열로 변환하는 데
 * 필요한 최소 편집 횟수(삽입, 삭제, 교체)입니다.
 *
 * 알고리즘:
 * - 동적 프로그래밍 방식 사용
 * - 시간 복잡도: O(m*n), 공간 복잡도: O(m*n)
 *
 * @param {string} str1 - 첫 번째 문자열
 * @param {string} str2 - 두 번째 문자열
 * @returns {number} 편집 거리 (0 이상의 정수)
 *
 * @example
 * levenshteinDistance('hello', 'hallo')  // 결과: 1
 * levenshteinDistance('hello', 'world')  // 결과: 4
 * levenshteinDistance('hello', 'hello')  // 결과: 0
 */
function levenshteinDistance(str1, str2) {
  // 빈 문자열 처리
  if (!str1) return str2 ? str2.length : 0;
  if (!str2) return str1.length;

  // 동일한 문자열
  if (str1 === str2) return 0;

  // DP 매트릭스 초기화
  const matrix = [];

  // 행 초기화
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  // 열 초기화
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // 매트릭스 채우기
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        // 문자가 같으면 대각선 값 그대로
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // 문자가 다르면 최소값 + 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // 교체
          matrix[i][j - 1] + 1,      // 삽입
          matrix[i - 1][j] + 1       // 삭제
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// ============================================================================
// 유사도 계산
// ============================================================================

/**
 * 두 문자열의 유사도를 계산합니다.
 *
 * Levenshtein distance를 기반으로 0.0 ~ 1.0 사이의 유사도 점수를 반환합니다.
 * - 1.0: 완전히 동일
 * - 0.0: 완전히 다름
 *
 * 계산 공식:
 *   similarity = (maxLength - distance) / maxLength
 *
 * @param {string} str1 - 첫 번째 문자열
 * @param {string} str2 - 두 번째 문자열
 * @returns {number} 유사도 (0.0 ~ 1.0)
 *
 * @example
 * similarity('hello', 'hello')  // 결과: 1.0
 * similarity('hello', 'hallo')  // 결과: 0.8
 * similarity('abc', 'xyz')      // 결과: 0.0
 */
function similarity(str1, str2) {
  // 정규화
  const normalized1 = normalize(str1);
  const normalized2 = normalize(str2);

  // 둘 다 빈 문자열이면 동일
  if (normalized1.length === 0 && normalized2.length === 0) {
    return 1.0;
  }

  // 하나만 빈 문자열이면 완전히 다름
  if (normalized1.length === 0 || normalized2.length === 0) {
    return 0.0;
  }

  // 완전히 동일한 경우
  if (normalized1 === normalized2) {
    return 1.0;
  }

  // 더 긴 문자열 기준으로 유사도 계산
  const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
  const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * 두 문자열이 완전히 일치하는지 확인합니다.
 *
 * 정규화 후 비교하므로 공백이나 특수문자 차이는 무시됩니다.
 *
 * @param {string} str1 - 첫 번째 문자열
 * @param {string} str2 - 두 번째 문자열
 * @returns {boolean} 일치 여부
 */
function exactMatch(str1, str2) {
  return normalize(str1) === normalize(str2);
}

// ============================================================================
// 프로그램 매칭
// ============================================================================

/**
 * 기존 프로그램과 새 프로그램 목록에서 매칭되는 프로그램을 찾습니다.
 *
 * 유사도 점수가 threshold 이상인 모든 프로그램을 반환합니다.
 * 결과는 점수가 높은 순으로 정렬됩니다.
 *
 * @param {Object} oldProgram - 기존 프로그램 객체 (title 속성 필요)
 * @param {Array} newPrograms - 새 프로그램 배열 (각 객체에 title 속성 필요)
 * @param {number} [threshold=0.85] - 매칭 임계값 (0.0 ~ 1.0)
 * @returns {Array} 매칭된 프로그램 배열 [{program, score}, ...]
 *
 * @example
 * const oldProg = { title: '[시즌1] 남북한걸음 독서모임' };
 * const newProgs = [
 *   { id: '1', title: '남북한걸음 독서모임 시즌1' },
 *   { id: '2', title: '요리 교실' }
 * ];
 * const matches = matchPrograms(oldProg, newProgs, 0.80);
 * // 결과: [{ program: { id: '1', ... }, score: 0.87 }]
 */
function matchPrograms(oldProgram, newPrograms, threshold = 0.85) {
  if (!oldProgram || !oldProgram.title) {
    console.warn('⚠️ 기존 프로그램 제목이 없습니다.');
    return [];
  }

  if (!Array.isArray(newPrograms) || newPrograms.length === 0) {
    return [];
  }

  const matches = [];

  for (const newProg of newPrograms) {
    if (!newProg || !newProg.title) continue;

    // 완전 일치 체크 (빠른 경로)
    if (exactMatch(oldProgram.title, newProg.title)) {
      matches.push({
        program: newProg,
        score: 1.0
      });
      continue;
    }

    // 유사도 계산
    const score = similarity(oldProgram.title, newProg.title);

    if (score >= threshold) {
      matches.push({
        program: newProg,
        score: score
      });
    }
  }

  // 점수 높은 순으로 정렬
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * 최적의 매칭을 찾습니다.
 *
 * matchPrograms의 편의 함수로, 가장 높은 점수의 매칭만 반환합니다.
 *
 * @param {Object} oldProgram - 기존 프로그램 객체
 * @param {Array} newPrograms - 새 프로그램 배열
 * @param {number} [threshold=0.85] - 매칭 임계값
 * @returns {Object|null} 최적 매칭 {program, score} 또는 null
 */
function findBestMatch(oldProgram, newPrograms, threshold = 0.85) {
  const matches = matchPrograms(oldProgram, newPrograms, threshold);
  return matches.length > 0 ? matches[0] : null;
}

// ============================================================================
// 테스트 케이스
// ============================================================================

/**
 * 테스트를 실행합니다.
 *
 * 이 함수는 모듈이 직접 실행될 때만 호출됩니다.
 * npm test 또는 node string-matcher.js 로 실행
 */
function runTests() {
  console.log('🧪 문자열 매칭 테스트 시작\n');

  // 테스트 케이스 정의
  const testCases = [
    // 정규화 테스트
    {
      name: 'normalize - 기본',
      fn: () => normalize('  [시즌1] 남북한걸음  '),
      expected: '시즌1 남북한걸음'
    },
    {
      name: 'normalize - 특수문자',
      fn: () => normalize('"플로깅+템플스테이" 프로그램'),
      expected: '플로깅 템플스테이 프로그램'
    },

    // Levenshtein distance 테스트
    {
      name: 'levenshtein - 동일',
      fn: () => levenshteinDistance('hello', 'hello'),
      expected: 0
    },
    {
      name: 'levenshtein - 1글자 차이',
      fn: () => levenshteinDistance('hello', 'hallo'),
      expected: 1
    },
    {
      name: 'levenshtein - 완전히 다름',
      fn: () => levenshteinDistance('abc', 'xyz'),
      expected: 3
    },

    // 유사도 테스트
    {
      name: 'similarity - 동일',
      fn: () => similarity('hello', 'hello'),
      expected: 1.0
    },
    {
      name: 'similarity - 유사',
      fn: () => Math.round(similarity('hello', 'hallo') * 10) / 10,
      expected: 0.8
    },
    {
      name: 'similarity - 한글 제목',
      fn: () => similarity('[시즌1] 남북한걸음', '시즌1 남북한걸음') >= 0.9,
      expected: true
    },

    // 매칭 테스트
    {
      name: 'matchPrograms - 기본',
      fn: () => {
        const old = { title: '[시즌1] 남북한걸음 독서모임 회원모집' };
        const news = [
          { id: '1', title: '[시즌1] 남북한걸음 독서모임 회원모집 공지' },
          { id: '2', title: '요리 교실' }
        ];
        return matchPrograms(old, news, 0.85).length;
      },
      expected: 1
    }
  ];

  // 테스트 실행
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    try {
      const result = tc.fn();
      const success = JSON.stringify(result) === JSON.stringify(tc.expected);

      if (success) {
        console.log(`  ✅ ${tc.name}`);
        passed++;
      } else {
        console.log(`  ❌ ${tc.name}`);
        console.log(`     기대값: ${JSON.stringify(tc.expected)}`);
        console.log(`     실제값: ${JSON.stringify(result)}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ❌ ${tc.name} - 오류: ${error.message}`);
      failed++;
    }
  }

  // 결과 요약
  console.log('\n' + '='.repeat(40));
  console.log(`테스트 결과: ${passed} 통과, ${failed} 실패`);
  console.log('='.repeat(40));

  return failed === 0;
}

// 직접 실행 시 테스트 수행
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

// ============================================================================
// 모듈 내보내기
// ============================================================================

module.exports = {
  // 기본 함수
  normalize,
  levenshteinDistance,
  similarity,
  exactMatch,

  // 프로그램 매칭
  matchPrograms,
  findBestMatch,

  // 테스트
  runTests
};
