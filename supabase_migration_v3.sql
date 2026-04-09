-- Woori Platform — Migration V3: Jobs, Courses, Materials, Announcements, FAQ, Inquiries
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- ═══════════════════════════════════════════════════════════════
-- 1. JOBS — Job postings
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  title_ko TEXT NOT NULL,
  title_en TEXT,
  position TEXT,
  location TEXT,
  employment_type TEXT,
  salary_range TEXT,
  requirements JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  description TEXT DEFAULT '',
  contact TEXT,
  posted_date TEXT,
  deadline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='jobs' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON jobs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO jobs (id, company, title_ko, title_en, position, location, employment_type, salary_range, requirements, benefits, description, contact, posted_date, deadline) VALUES
  (1, '우리은행', '시니어 금융 컨설턴트', 'Senior Financial Consultant', '금융 컨설턴트', '서울 중구', '계약직', '연봉 5,000만원 ~ 6,000만원 (협의가능)',
    '["금융권 경력 15년 이상", "자산관리 및 투자 상담 경험 우대"]'::jsonb,
    '["유연근무제", "4대보험", "경조금 지원", "자기계발비 지원"]'::jsonb,
    'VIP 고객 대상 자산관리 및 투자 포트폴리오 컨설팅 업무를 담당합니다. 은퇴 설계, 세무 상담, 부동산 자문 등 종합 금융 서비스를 제공하며, 풍부한 경험을 바탕으로 고객 맞춤형 솔루션을 제시합니다.',
    '인사담당자 02-2002-3000', '2026.03.20', '2026.06.20'),
  (4, '현대건설', '부동산 자문위원', 'Real Estate Advisory', '부동산 자문', '경기 성남시', '프리랜서', '프로젝트별 협의',
    '["부동산 개발 및 투자 분석 경력 10년 이상", "관련 네트워크 보유자 우대"]'::jsonb,
    '["프로젝트 성과급", "유연 근무", "차량 지원"]'::jsonb,
    '대규모 부동산 개발 프로젝트의 투자 타당성 분석 및 자문 업무를 수행합니다. 시장 분석, 리스크 평가, 투자 수익률 검토 등 전문적인 부동산 자문 서비스를 제공합니다.',
    '인사팀 031-000-1234', '2026.03.12', '2026.07.01'),
  (5, '신한은행', '자산관리 시니어 컨설턴트', 'Senior Wealth Management Consultant', '자산관리 컨설턴트', '서울 강남구', '정규직', '연봉 5,500만원 ~ 7,000만원',
    '["자산관리 경력 10년 이상", "WM 센터 근무 경험 우대"]'::jsonb,
    '["4대보험", "성과급", "복지카드", "자녀학자금"]'::jsonb,
    '고액 자산가 고객을 대상으로 종합 자산관리 서비스를 제공합니다. 투자 상품 추천, 포트폴리오 리밸런싱, 은퇴 설계 등 맞춤형 WM 서비스를 담당합니다.',
    '채용담당 02-3456-7890', '2026.03.10', '2026.06.30'),
  (6, 'NH농협', '농촌 금융 전문 상담역', 'Rural Finance Specialist', '금융 상담역', '전국', '계약직', '월 400만원 (협의가능)',
    '["농업 금융 또는 지역 금융 경력", "지역 네트워크 보유자 우대"]'::jsonb,
    '["4대보험", "차량 지원", "주거 지원(지방)", "성과급"]'::jsonb,
    '농촌 지역 금융 소외 계층을 위한 맞춤형 금융 상담 서비스를 제공합니다. 농업 자금 대출, 보조금 안내, 재무 설계 등 지역 밀착형 금융 서비스를 담당합니다.',
    '인사부 1588-2100', '2026.03.08', '2026.06.25')
ON CONFLICT (id) DO NOTHING;

SELECT setval('jobs_id_seq', (SELECT COALESCE(MAX(id), 0) FROM jobs));

-- ═══════════════════════════════════════════════════════════════
-- 2. COURSES — Online courses
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  instructor TEXT,
  duration TEXT,
  views INT DEFAULT 0,
  created_at TEXT,
  thumbnail TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  status TEXT DEFAULT '게시중',
  description TEXT DEFAULT '',
  lessons JSONB DEFAULT '[]',
  enrollments INT DEFAULT 0,
  created_ts TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='courses' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON courses FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO courses (id, title, category, instructor, duration, views, created_at, thumbnail, video_url, status, description, lessons, enrollments) VALUES
  ('mock-1', '디지털 금융 트렌드 2026', '금융컨설팅', '김재현 컨설턴트', '45:00', 1234, '2026.03.15', '', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '게시중',
    '2026년 디지털 금융의 최신 트렌드를 분석하고, 시니어 세대가 알아야 할 핵심 금융 기술과 서비스를 소개합니다.',
    '[{"id":"mock-1-1","title":"디지털 금융의 현재와 미래","duration":"15:00","video_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"},{"id":"mock-1-2","title":"모바일 뱅킹 200% 활용하기","duration":"15:00","video_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"},{"id":"mock-1-3","title":"AI 기반 자산관리 서비스","duration":"15:00","video_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}]'::jsonb, 87),
  ('mock-2', '시니어를 위한 AI 활용법', '기타', '박지영 컨설턴트', '38:20', 892, '2026.03.10', '', 'https://www.youtube.com/watch?v=jNQXAC9IVRw', '게시중',
    '인공지능 기술을 일상생활과 업무에 활용하는 방법을 시니어 눈높이에 맞춰 쉽게 설명합니다.',
    '[{"id":"mock-2-1","title":"AI란 무엇인가?","duration":"12:00","video_url":"https://www.youtube.com/watch?v=jNQXAC9IVRw"},{"id":"mock-2-2","title":"ChatGPT 실전 활용법","duration":"14:20","video_url":"https://www.youtube.com/watch?v=kJQP7kiw5Fk"},{"id":"mock-2-3","title":"AI로 업무 효율 높이기","duration":"12:00","video_url":"https://www.youtube.com/watch?v=RgKAFK5djSk"}]'::jsonb, 56),
  ('mock-3', '부동산 투자 기초 가이드', '부동산', '이민호 컨설턴트', '52:10', 2156, '2026.02.28', '', 'https://www.youtube.com/watch?v=9bZkp7q19f0', '게시중',
    '부동산 투자의 기본 개념부터 실전 전략까지, 안정적인 부동산 투자를 위한 종합 가이드입니다.',
    '[{"id":"mock-3-1","title":"부동산 시장 분석 기초","duration":"18:00","video_url":"https://www.youtube.com/watch?v=9bZkp7q19f0"},{"id":"mock-3-2","title":"수익형 부동산 투자 전략","duration":"17:10","video_url":"https://www.youtube.com/watch?v=JGwWNGJdvx8"},{"id":"mock-3-3","title":"부동산 세금과 법률 상식","duration":"17:00","video_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}]'::jsonb, 142),
  ('mock-4', '성공적인 창업 전략', '창업', '김재현 컨설턴트', '41:30', 1567, '2026.02.20', '', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', '게시중',
    '퇴직 후 성공적인 창업을 위한 전략과 노하우를 공유합니다. 사업 아이디어 발굴부터 사업계획서 작성까지 단계별로 안내합니다.',
    '[{"id":"mock-4-1","title":"창업 아이디어 발굴법","duration":"14:00","video_url":"https://www.youtube.com/watch?v=kJQP7kiw5Fk"},{"id":"mock-4-2","title":"사업계획서 작성 가이드","duration":"15:30","video_url":"https://www.youtube.com/watch?v=RgKAFK5djSk"},{"id":"mock-4-3","title":"자금 조달과 투자 유치","duration":"12:00","video_url":"https://www.youtube.com/watch?v=JGwWNGJdvx8"}]'::jsonb, 98),
  ('mock-5', '자산관리와 은퇴 설계', '금융컨설팅', '박지영 컨설턴트', '35:45', 3421, '2026.02.15', '', 'https://www.youtube.com/watch?v=RgKAFK5djSk', '게시중',
    '체계적인 자산관리와 은퇴 설계 방법을 배웁니다. 연금, 보험, 투자 등 다양한 금융 상품을 활용한 은퇴 준비 전략을 제시합니다.',
    '[{"id":"mock-5-1","title":"은퇴 자금 얼마나 필요할까?","duration":"12:00","video_url":"https://www.youtube.com/watch?v=RgKAFK5djSk"},{"id":"mock-5-2","title":"연금과 보험 최적화","duration":"12:45","video_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"},{"id":"mock-5-3","title":"투자 포트폴리오 구성","duration":"11:00","video_url":"https://www.youtube.com/watch?v=jNQXAC9IVRw"}]'::jsonb, 215),
  ('mock-6', '사회공헌 활동 시작하기', '사회공헌', '이민호 컨설턴트', '28:15', 678, '2026.02.10', '', 'https://www.youtube.com/watch?v=JGwWNGJdvx8', '게시중',
    '은퇴 후 의미 있는 사회공헌 활동을 시작하는 방법을 안내합니다. 봉사활동, 멘토링, 재능기부 등 다양한 참여 방법을 소개합니다.',
    '[{"id":"mock-6-1","title":"사회공헌 활동의 종류와 시작","duration":"15:00","video_url":"https://www.youtube.com/watch?v=JGwWNGJdvx8"},{"id":"mock-6-2","title":"재능기부와 멘토링 참여하기","duration":"13:15","video_url":"https://www.youtube.com/watch?v=9bZkp7q19f0"}]'::jsonb, 34)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 3. MATERIALS — Downloadable materials
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  file_type TEXT,
  file_size TEXT,
  download_count INT DEFAULT 0,
  file_url TEXT DEFAULT '#',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='materials' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON materials FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO materials (id, title, category, file_type, file_size, download_count, file_url) VALUES
  ('mat-1', '은퇴설계 가이드북', '금융컨설팅', 'pdf', '2.4 MB', 328, '#'),
  ('mat-2', '부동산 투자 체크리스트', '부동산', 'xlsx', '540 KB', 215, '#'),
  ('mat-3', '창업 사업계획서 템플릿', '창업', 'docx', '1.1 MB', 189, '#')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 4. ANNOUNCEMENTS — Notice board
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT DEFAULT '일반',
  category TEXT DEFAULT '일반',
  status TEXT DEFAULT '게시',
  date TEXT,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='announcements' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON announcements FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO announcements (id, title, content, type, category, status, date, views) VALUES
  (1, '2026년 상반기 프로그램 일정 안내', '2026년 상반기 프로그램 일정을 안내드립니다. 금융컨설팅, 부동산, 창업, 사회공헌 분야의 다양한 프로그램이 준비되어 있습니다. 자세한 내용은 프로그램 페이지를 참고해 주세요.', '공지', '프로그램', '게시', '2026.03.20', 156),
  (2, '시스템 점검 안내 (4/15)', '2026년 4월 15일 오전 2시~6시 시스템 정기 점검이 예정되어 있습니다. 점검 시간 동안 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.', '긴급', '시스템', '게시', '2026.03.18', 89),
  (3, '신규 온라인 강좌 오픈 안내', '디지털 금융 트렌드 2026, 시니어를 위한 AI 활용법 등 새로운 온라인 강좌가 오픈되었습니다. 교육 페이지에서 수강 신청하실 수 있습니다.', '일반', '교육', '게시', '2026.03.15', 234),
  (4, '퇴직 컨시어지 서비스 이용 가이드', '우리은행 퇴직 컨시어지 서비스의 전체 이용 방법을 안내합니다. 상담 예약, 프로그램 신청, 온라인 교육 수강 등 다양한 서비스를 활용해 보세요.', '일반', '일반', '게시', '2026.03.01', 412)
ON CONFLICT (id) DO NOTHING;

SELECT setval('announcements_id_seq', (SELECT COALESCE(MAX(id), 0) FROM announcements));

-- ═══════════════════════════════════════════════════════════════
-- 5. FAQ — Frequently Asked Questions
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS faq (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT '일반',
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faq' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON faq FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO faq (id, question, answer, category, views) VALUES
  (1, '퇴직 컨시어지 서비스는 누가 이용할 수 있나요?', '우리은행 퇴직(예정)자 및 은퇴를 준비하는 고객이라면 누구나 이용하실 수 있습니다. 회원가입 후 다양한 프로그램과 상담 서비스를 무료로 이용하실 수 있습니다.', '일반', 89),
  (2, '프로그램은 어떻게 신청하나요?', '로그인 후 프로그램 페이지에서 원하시는 프로그램을 선택하고 ''신청하기'' 버튼을 클릭하시면 됩니다. 신청 후 관리자 승인을 거쳐 참여가 확정됩니다.', '프로그램', 76),
  (3, '상담 예약은 어떻게 하나요?', '상담 페이지에서 원하시는 날짜, 시간, 상담 방법(온라인/오프라인/전화)을 선택하여 예약하실 수 있습니다. 예약 후 담당 컨설턴트가 배정되며, 확정 안내를 드립니다.', '상담', 65),
  (4, '온라인 강좌는 무료인가요?', '네, 현재 제공되는 모든 온라인 강좌는 회원가입 후 무료로 수강하실 수 있습니다. 교육 페이지에서 다양한 분야의 강좌를 확인해 보세요.', '교육', 54),
  (5, '채용 정보는 어떻게 확인하나요?', '채용 페이지에서 시니어 맞춤 채용 정보를 확인하실 수 있습니다. 금융, 부동산, 컨설팅 등 다양한 분야의 채용 공고가 등록되어 있으며, 수시로 업데이트됩니다.', '채용', 42),
  (6, '개인정보는 안전하게 보호되나요?', '본 서비스는 개인정보보호법에 따라 고객님의 개인정보를 안전하게 관리하고 있습니다. 암호화 저장, 접근 권한 제한 등 다양한 보안 조치를 적용하고 있습니다.', '일반', 38)
ON CONFLICT (id) DO NOTHING;

SELECT setval('faq_id_seq', (SELECT COALESCE(MAX(id), 0) FROM faq));

-- ═══════════════════════════════════════════════════════════════
-- 6. INQUIRIES — Support inquiries
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  category TEXT DEFAULT '일반',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT '접수',
  answer TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='inquiries' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON inquiries FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════════
