/**
 * Shared localStorage store for programs and applications.
 * Used by both user-facing pages and admin/instructor pages
 * so that data stays in sync across roles.
 */

const PROGRAMS_KEY = 'woori_programs';
const APPLICATIONS_KEY = 'woori_program_applications';

// ── Default seed data (used on first load) ──

const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

const autoStatus = (startDate, endDate, manualStatus) => {
  if (endDate < today) return '종료';
  if (manualStatus) return manualStatus;
  return '모집중';
};

const SEED_PROGRAMS = [
  { id: 1, title_ko: '은퇴 후 자산 관리 심화 과정', category: '금융컨설팅', status: '모집중', start_date: '2026.04.01', end_date: '2026.06.30', applicants: 12, capacity: 30, description: '은퇴를 앞두고 있거나 이미 은퇴한 분들을 위한 자산 관리 심화 프로그램입니다.\n\n주요 내용:\n- 은퇴 후 소득 원천 다변화 전략\n- 부동산 및 금융자산 포트폴리오 관리\n- 세금 최적화 및 상속 계획\n- 안정적인 현금흐름 창출 방법', location: '우리은행 본점 교육관', instructor: '김재무 전문위원' },
  { id: 2, title_ko: '도심형 소규모 부동산 투자 전략', category: '부동산', status: '모집중', start_date: '2026.04.10', end_date: '2026.05.31', applicants: 28, capacity: 35, description: '부동산 투자의 기초부터 고급 전략까지 배웁니다.', location: '우리은행 강남 교육센터', instructor: '박부동 컨설턴트' },
  { id: 3, title_ko: '제2의 인생, 창업 아이디어 워크숍', category: '창업', status: '마감예정', start_date: '2026.03.25', end_date: '2026.04.20', applicants: 38, capacity: 40, description: '퇴직 후 창업을 꿈꾸는 시니어를 위한 실전 프로그램입니다.', location: '우리은행 본점 세미나실', instructor: '이창업 대표' },
  { id: 4, title_ko: '지역 사회 봉사 활동 리더 양성', category: '사회공헌', status: '진행중', start_date: '2026.03.01', end_date: '2026.08.31', applicants: 56, capacity: 100, description: '지역 사회에 기여할 수 있는 봉사 프로그램입니다.', location: '각 지역 센터', instructor: '정봉사 위원' },
  { id: 5, title_ko: '디지털 금융 활용 교육 (시니어)', category: '금융컨설팅', status: '종료', start_date: '2025.12.25', end_date: '2026.01.15', applicants: 40, capacity: 40, description: '디지털 금융 서비스 활용법을 배웁니다.', location: '온라인', instructor: '최디지털 강사' },
  { id: 6, title_ko: '은퇴 전문가 매칭 및 컨설팅', category: '금융컨설팅', status: '모집중', start_date: '2026.04.08', end_date: '2026.05.28', applicants: 15, capacity: 30, description: '전문가 매칭을 통한 맞춤 컨설팅 프로그램입니다.', location: '우리은행 본점', instructor: '강매칭 팀장' },
].map((p) => ({ ...p, status: autoStatus(p.start_date, p.end_date, p.status) }));

// Applications use real system accounts (user1, user2, user3)
const SEED_APPLICATIONS = [
  { id: 1, user_name: '홍길동', email: 'user1@woori.com', programId: '1', program_title: '은퇴 후 자산 관리 심화 과정', category: '금융컨설팅', applied_at: '2026.03.20', date: '2026.03.20', status: '승인대기' },
  { id: 2, user_name: '김영희', email: 'user2@woori.com', programId: '2', program_title: '도심형 소규모 부동산 투자 전략', category: '부동산', applied_at: '2026.03.19', date: '2026.03.19', status: '승인대기' },
  { id: 3, user_name: '이철수', email: 'user3@woori.com', programId: '3', program_title: '제2의 인생, 창업 아이디어 워크숍', category: '창업', applied_at: '2026.03.18', date: '2026.03.18', status: '승인대기' },
  { id: 4, user_name: '홍길동', email: 'user1@woori.com', programId: '6', program_title: '은퇴 전문가 매칭 및 컨설팅', category: '금융컨설팅', applied_at: '2026.03.15', date: '2026.03.15', status: '승인' },
  { id: 5, user_name: '김영희', email: 'user2@woori.com', programId: '4', program_title: '지역 사회 봉사 활동 리더 양성', category: '사회공헌', applied_at: '2026.03.16', date: '2026.03.16', status: '승인' },
  { id: 6, user_name: '이철수', email: 'user3@woori.com', programId: '1', program_title: '은퇴 후 자산 관리 심화 과정', category: '금융컨설팅', applied_at: '2026.03.14', date: '2026.03.14', status: '반려' },
];

// ── Programs ──

export const loadPrograms = () => {
  try {
    const saved = localStorage.getItem(PROGRAMS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  // First load — seed
  savePrograms(SEED_PROGRAMS);
  return SEED_PROGRAMS;
};

export const savePrograms = (programs) => {
  localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs));
};

export const getProgramById = (id) => {
  const programs = loadPrograms();
  return programs.find((p) => String(p.id) === String(id)) || null;
};

// ── Applications ──

export const loadApplications = () => {
  try {
    const saved = localStorage.getItem(APPLICATIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  saveApplications(SEED_APPLICATIONS);
  return SEED_APPLICATIONS;
};

export const saveApplications = (apps) => {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
};

export const getApplicationsForProgram = (programId) => {
  const apps = loadApplications();
  return apps.filter((a) => String(a.programId) === String(programId));
};

export const getUserApplication = (programId) => {
  const apps = loadApplications();
  return apps.find(
    (a) => String(a.programId) === String(programId) && a.status !== '취소'
  );
};
