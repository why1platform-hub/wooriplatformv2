// Shared mock job data used across Home, JobList, JobDetail, Favorites, MyActivities

const BOOKMARK_KEY = 'woori_job_bookmarks';

export const MOCK_JOBS = [
  {
    id: 1,
    company: '우리은행',
    title_ko: '시니어 금융 컨설턴트',
    title_en: 'Senior Financial Consultant',
    position: '시니어 금융 컨설턴트',
    location: '서울 중구',
    employment_type: '계약직',
    type: '계약직',
    salary_range: '연봉 5,000만원 ~ 6,000만원 (협의가능)',
    requirements: ['금융권 경력 15년 이상', '자산관리 및 투자 상담 경험 우대'],
    benefits: ['유연근무제', '4대보험', '경조금 지원', '자기계발비 지원'],
    description: `우리은행에서 시니어 금융 컨설턴트를 모집합니다.\n\n주요 업무:\n- 고객 자산관리 상담 및 컨설팅\n- 투자 포트폴리오 분석 및 추천\n- VIP 고객 관리 및 관계 유지\n- 금융상품 설명 및 판매\n\n자격요건:\n- 금융권 경력 15년 이상\n- 자산관리 및 투자 상담 경험 우대\n- 관련 자격증 보유자 우대 (CFP, AFPK 등)\n\n우대사항:\n- 우리은행 퇴직자 우대\n- 고객 네트워크 보유자 우대`,
    contact: '인사담당자 02-2002-3000',
    posted_date: '2026.03.20',
    deadline: '2026.06.20',
  },
  {
    id: 2,
    company: 'KB국민은행',
    title_ko: '디지털 금융 플랫폼 기획자',
    title_en: 'Digital Finance Platform Planner',
    position: '디지털 금융 플랫폼 기획자',
    location: '서울 여의도',
    employment_type: '정규직',
    type: '정규직',
    salary_range: '연봉 6,000만원 ~ 7,500만원',
    requirements: ['IT/금융 분야 경력 10년 이상', '디지털 플랫폼 기획 경험'],
    benefits: ['정규직 전환 가능', '4대보험', '성과급', '교통비 지원'],
    description: `KB국민은행에서 디지털 금융 플랫폼 기획자를 모집합니다.\n\n주요 업무:\n- 디지털 뱅킹 서비스 기획 및 운영\n- 핀테크 트렌드 분석 및 신규 서비스 제안\n- 사용자 경험(UX) 개선 프로젝트 리드\n- 유관 부서 협업 및 프로젝트 관리\n\n자격요건:\n- IT/금융 분야 경력 10년 이상\n- 디지털 플랫폼 기획 경험\n- 데이터 분석 역량\n\n우대사항:\n- 금융권 출신 우대\n- 애자일 방법론 경험자`,
    contact: '채용담당 02-2073-7000',
    posted_date: '2026.03.18',
    deadline: '2026.06.15',
  },
  {
    id: 3,
    company: '삼성생명',
    title_ko: '퇴직연금 전문 상담역',
    title_en: 'Retirement Pension Specialist',
    position: '퇴직연금 전문 상담역',
    location: '서울 강남구',
    employment_type: '정규직',
    type: '정규직',
    salary_range: '협의 후 결정',
    requirements: ['퇴직연금 관련 자격증 소지자', '법인 및 개인 고객 상담 능력 필수'],
    benefits: ['4대보험', '인센티브', '교육비 지원', '건강검진'],
    description: `삼성생명에서 퇴직연금 전문 상담역을 모집합니다.\n\n주요 업무:\n- 퇴직연금(DB/DC/IRP) 상품 상담\n- 법인 고객 퇴직연금 컨설팅\n- 개인 고객 노후 설계 상담\n- 시장 동향 분석 및 보고\n\n자격요건:\n- 퇴직연금 관련 자격증 소지자\n- 법인 및 개인 고객 상담 능력 필수\n- 금융 경력 10년 이상\n\n우대사항:\n- 보험/연금 분야 전문가\n- 고객 포트폴리오 보유자`,
    contact: '인사부 02-2145-5000',
    posted_date: '2026.03.15',
    deadline: '2026.06.10',
  },
  {
    id: 4,
    company: '현대건설',
    title_ko: '부동산 자문위원',
    title_en: 'Real Estate Advisory',
    position: '부동산 자문위원',
    location: '경기 성남시',
    employment_type: '프리랜서',
    type: '프리랜서',
    salary_range: '프로젝트별 협의',
    requirements: ['부동산 개발 및 투자 분석 경력 10년 이상', '관련 네트워크 보유자 우대'],
    benefits: ['프로젝트 성과급', '유연 근무', '차량 지원'],
    description: `현대건설에서 부동산 자문위원을 모집합니다.\n\n주요 업무:\n- 부동산 개발 프로젝트 자문\n- 투자 타당성 분석 및 리스크 평가\n- 시장 조사 및 트렌드 분석\n- 고객사 투자 자문\n\n자격요건:\n- 부동산 개발 및 투자 분석 경력 10년 이상\n- 관련 네트워크 보유자 우대\n- 감정평가사/공인중개사 자격 우대\n\n우대사항:\n- 대형 건설사 출신 우대\n- 해외 부동산 투자 경험자`,
    contact: '자문위원 채용 031-000-0000',
    posted_date: '2026.03.12',
    deadline: '2026.07.01',
  },
  {
    id: 5,
    company: '신한은행',
    title_ko: '자산관리 시니어 컨설턴트',
    title_en: 'Senior Wealth Management Consultant',
    position: '자산관리 시니어 컨설턴트',
    location: '서울 강남구',
    employment_type: '정규직',
    type: '정규직',
    salary_range: '연봉 5,500만원 ~ 7,000만원',
    requirements: ['자산관리 경력 10년 이상', 'WM 센터 근무 경험 우대'],
    benefits: ['4대보험', '성과급', '복지카드', '자녀학자금'],
    description: `신한은행에서 자산관리 시니어 컨설턴트를 모집합니다.\n\n주요 업무:\n- 고액자산가 종합 자산관리 상담\n- 투자 포트폴리오 설계 및 리밸런싱\n- 세무/부동산 통합 컨설팅\n- 고객 세미나 기획 및 진행\n\n자격요건:\n- 자산관리 경력 10년 이상\n- WM 센터 근무 경험 우대\n- CFP, AFPK 등 관련 자격증\n\n우대사항:\n- 은행/증권사 WM 출신\n- UHNW 고객 관리 경험자`,
    contact: '인재채용팀 02-3456-7890',
    posted_date: '2026.03.10',
    deadline: '2026.06.30',
  },
  {
    id: 6,
    company: 'NH농협',
    title_ko: '농촌 금융 전문 상담역',
    title_en: 'Rural Finance Specialist',
    position: '농촌 금융 전문 상담역',
    location: '전국',
    employment_type: '계약직',
    type: '계약직',
    salary_range: '월 400만원 (협의가능)',
    requirements: ['농업 금융 또는 지역 금융 경력', '지역 네트워크 보유자 우대'],
    benefits: ['4대보험', '차량 지원', '주거 지원(지방)', '성과급'],
    description: `NH농협에서 농촌 금융 전문 상담역을 모집합니다.\n\n주요 업무:\n- 농업인 대상 금융 상품 상담\n- 농촌 지역 경제 활성화 사업 지원\n- 정책자금 안내 및 신청 지원\n- 지역 농협 금융 컨설팅\n\n자격요건:\n- 농업 금융 또는 지역 금융 경력\n- 지역 네트워크 보유자 우대\n- 운전면허 필수\n\n우대사항:\n- 농협 퇴직자 우대\n- 농업 관련 전문 지식 보유자`,
    contact: '인사부 02-2080-5000',
    posted_date: '2026.03.08',
    deadline: '2026.06.25',
  },
];

export const getJobById = (id) => {
  const numId = Number(id);
  return MOCK_JOBS.find((j) => j.id === numId) || null;
};

export const getBookmarkedIds = () => {
  return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
};

export const isBookmarked = (id) => {
  return getBookmarkedIds().includes(Number(id));
};

export const toggleBookmark = (id) => {
  const numId = Number(id);
  const saved = getBookmarkedIds();
  const newState = !saved.includes(numId);
  if (newState) {
    if (!saved.includes(numId)) saved.push(numId);
  } else {
    const idx = saved.indexOf(numId);
    if (idx > -1) saved.splice(idx, 1);
  }
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(saved));
  return newState;
};

export const getBookmarkedJobs = () => {
  const ids = getBookmarkedIds();
  return MOCK_JOBS.filter((j) => ids.includes(j.id));
};
