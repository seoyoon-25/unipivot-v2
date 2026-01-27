import { getPrograms } from '@/lib/actions/admin'
import ProgramsGroupedView from './ProgramsGroupedView'

// 프로그램 상태 계산
function getProgramStatus(program: any) {
  const today = new Date();
  // 올바른 필드명 사용: recruitStartDate, recruitEndDate, startDate, endDate
  const recruitStart = program.recruitStartDate ? new Date(program.recruitStartDate) : null;
  const recruitEnd = program.recruitEndDate ? new Date(program.recruitEndDate) : null;
  const programStart = program.startDate ? new Date(program.startDate) : null;
  const programEnd = program.endDate ? new Date(program.endDate) : null;

  // 날짜가 없으면 기본 상태 반환
  if (!recruitStart || !recruitEnd || !programStart || !programEnd) {
    return '정보없음';
  }

  if (today < recruitStart) {
    return '준비중';
  } else if (today >= recruitStart && today <= recruitEnd) {
    // 참가자 수 확인 (registrations 사용)
    const approvedCount = program._count?.registrations || 0;
    const maxParticipants = program.capacity || 0;

    if (maxParticipants > 0 && approvedCount >= maxParticipants) {
      return '모집마감';
    }
    return '모집중';
  } else if (today < programStart) {
    return '대기중';
  } else if (today >= programStart && today <= programEnd) {
    return '진행중';
  } else {
    return '완료';
  }
}

// 마감 임박 체크 (모집 종료 3일 이하)
function isUrgent(program: any) {
  if (!program.recruitEndDate) return false;

  const today = new Date();
  const recruitEnd = new Date(program.recruitEndDate);
  const daysUntilEnd = Math.floor(
    (recruitEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const status = getProgramStatus(program);
  return status === '모집중' && daysUntilEnd >= 0 && daysUntilEnd <= 3;
}

interface Props {
  searchParams: { page?: string; search?: string; type?: string; status?: string }
}

export default async function ProgramsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  // 그룹별 뷰를 위해 전체 프로그램 가져오기 (limit 제거)
  const { programs, total, pages } = await getPrograms({
    page,
    limit: 1000, // 충분히 큰 숫자로 전체 가져오기
    search: searchParams.search,
    type: searchParams.type,
    status: searchParams.status
  })

  // 디버그: 프로그램 데이터 확인
  console.error('========================================');
  console.error('🔍 디버그: 프로그램 데이터 확인');
  console.error('========================================');
  console.error('전체 프로그램 수:', programs.length);
  if (programs[0]) {
    console.error('첫 번째 프로그램:', JSON.stringify({
      title: programs[0].title,
      recruitStartDate: programs[0].recruitStartDate,
      recruitEndDate: programs[0].recruitEndDate,
      startDate: programs[0].startDate,
      endDate: programs[0].endDate,
      capacity: programs[0].capacity,
      _count: programs[0]._count
    }, null, 2));
    console.error('첫 번째 프로그램 계산된 상태:', getProgramStatus(programs[0]));
  }

  // 프로그램 상태 확인용 로그
  console.log('프로그램 상태:', programs.map(p => ({
    title: p.title,
    status: getProgramStatus(p)
  })));

  // 상태별로 프로그램 분류
  const recruiting = programs.filter(p => {
    const status = getProgramStatus(p);
    return status === '모집중' || status === '모집마감';
  });

  const ongoing = programs.filter(p =>
    getProgramStatus(p) === '진행중'
  );

  const completed = programs.filter(p =>
    getProgramStatus(p) === '완료'
  );

  // 정보없음/준비중/대기중 상태 (날짜 미설정 포함)
  const other = programs.filter(p => {
    const status = getProgramStatus(p);
    return status === '정보없음' || status === '준비중' || status === '대기중';
  });

  // 콘솔에 개수 출력 (눈에 띄게)
  console.error('========================================');
  console.error('🔥🔥🔥 프로그램 분류 결과 🔥🔥🔥');
  console.error('========================================');
  console.error('🔥🔥🔥 모집중:', recruiting.length, '개');
  console.warn('🔄🔄🔄 진행중:', ongoing.length, '개');
  console.info('✅✅✅ 완료:', completed.length, '개');
  console.error('📊📊📊 전체:', programs.length, '개');

  // 각 그룹 상세 확인
  console.error('모집중 프로그램:', JSON.stringify(recruiting.map(p => ({
    title: p.title,
    status: getProgramStatus(p),
    urgent: isUrgent(p)
  })), null, 2));

  console.warn('진행중 프로그램:', JSON.stringify(ongoing.map(p => ({
    title: p.title,
    status: getProgramStatus(p)
  })), null, 2));

  console.info('완료 프로그램 (처음 3개):', JSON.stringify(completed.slice(0, 3).map(p => ({
    title: p.title,
    status: getProgramStatus(p)
  })), null, 2));

  // 각 프로그램에 계산된 상태와 긴급 여부 추가
  const addCalculatedFields = (program: any) => ({
    ...program,
    calculatedStatus: getProgramStatus(program),
    isUrgent: isUrgent(program)
  });

  return (
    <ProgramsGroupedView
      recruiting={recruiting.map(addCalculatedFields)}
      ongoing={ongoing.map(addCalculatedFields)}
      completed={completed.map(addCalculatedFields)}
      other={other.map(addCalculatedFields)}
      total={total}
      searchParams={searchParams}
    />
  )
}
