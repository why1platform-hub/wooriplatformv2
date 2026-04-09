-- Woori Platform — Full Supabase Setup (run once)
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- ═══════════════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  title_ko TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '모집중',
  start_date TEXT,
  end_date TEXT,
  applicants INT DEFAULT 0,
  capacity INT DEFAULT 30,
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  instructor TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS program_applications (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL,
  program_id TEXT NOT NULL,
  program_title TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT '승인대기',
  applied_at TEXT NOT NULL,
  date TEXT
);

CREATE TABLE IF NOT EXISTS consultation_bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('온라인', '오프라인', '전화')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_approval', 'confirmed', 'completed', 'cancelled')),
  consultant_id INT,
  consultant_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultation_notes (
  booking_id INT PRIMARY KEY REFERENCES consultation_bookings(id),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intake_forms (
  user_id INT PRIMARY KEY,
  form_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS instructor_availability (
  id SERIAL PRIMARY KEY,
  instructor_id INT NOT NULL,
  date TEXT NOT NULL,
  slots JSONB NOT NULL DEFAULT '[]',
  session_duration INT NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instructor_id, date)
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_config' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON site_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='programs' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON programs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='program_applications' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON program_applications FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='consultation_bookings' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON consultation_bookings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='consultation_notes' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON consultation_notes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='intake_forms' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON intake_forms FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='instructor_availability' AND policyname='Allow all') THEN
    CREATE POLICY "Allow all" ON instructor_availability FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════

-- Branding
INSERT INTO site_config (key, value) VALUES
  ('branding', '{"title_ko": "우리은행 퇴직 컨시어지 서비스", "title_en": "Woori Bank Retirement Concierge Service", "title_short_ko": "퇴직 컨시어지", "title_short_en": "Retirement Concierge"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Programs
INSERT INTO programs (id, title_ko, category, status, start_date, end_date, applicants, capacity, description, location, instructor) VALUES
  (1, '은퇴 후 자산 관리 심화 과정', '금융컨설팅', '모집중', '2026.04.01', '2026.06.30', 0, 30, '은퇴를 앞두고 있거나 이미 은퇴한 분들을 위한 자산 관리 심화 프로그램입니다.', '우리은행 본점 교육관', '김재무 전문위원'),
  (2, '도심형 소규모 부동산 투자 전략', '부동산', '모집중', '2026.04.10', '2026.05.31', 0, 35, '부동산 투자의 기초부터 고급 전략까지 배웁니다.', '우리은행 강남 교육센터', '박부동 컨설턴트'),
  (3, '제2의 인생, 창업 아이디어 워크숍', '창업', '마감예정', '2026.03.25', '2026.04.20', 0, 40, '퇴직 후 창업을 꿈꾸는 시니어를 위한 실전 프로그램입니다.', '우리은행 본점 세미나실', '이창업 대표'),
  (4, '지역 사회 봉사 활동 리더 양성', '사회공헌', '진행중', '2026.03.01', '2026.08.31', 0, 100, '지역 사회에 기여할 수 있는 봉사 프로그램입니다.', '각 지역 센터', '정봉사 위원'),
  (5, '디지털 금융 활용 교육 (시니어)', '금융컨설팅', '종료', '2025.12.25', '2026.01.15', 0, 40, '디지털 금융 서비스 활용법을 배웁니다.', '온라인', '최디지털 강사'),
  (6, '은퇴 전문가 매칭 및 컨설팅', '금융컨설팅', '모집중', '2026.04.08', '2026.05.28', 0, 30, '전문가 매칭을 통한 맞춤 컨설팅 프로그램입니다.', '우리은행 본점', '강매칭 팀장')
ON CONFLICT (id) DO NOTHING;

SELECT setval('programs_id_seq', (SELECT COALESCE(MAX(id), 0) FROM programs));

-- ═══════════════════════════════════════════════════════════════
-- SEED PROGRAM APPLICATIONS (real rows — these drive the counts)
--
-- Program 1: 12 registrants (including user1)
-- Program 2: 28 registrants (including user1, user2, user3)
-- Program 3: 38 registrants (including user3)
-- Program 4: 56 registrants (including user2)
-- Program 5: 40 registrants (closed)
-- Program 6: 15 registrants (including user1)
-- ═══════════════════════════════════════════════════════════════

-- Helper: generate bulk anonymous registrants for realistic counts
DO $$
DECLARE
  i INT;
  names TEXT[] := ARRAY['강민수','박서연','최준호','정하늘','윤도현','임수진','한지우','오태양','배수빈','송민재',
    '조현우','류가영','신동훈','전소영','권태호','남지현','문성호','양미래','허은비','구자현',
    '안채원','홍승우','유다은','차민혁','방소율','표진우','피가람','노태현','하윤서','곽도윤',
    '서예린','장현준','원소희','공태윤','편도경','빈가은','탁민서','국승현','길하은','두진영',
    '매소정','봉태린','석가윤','어진수','옹미소','기라온','낭도담','봄나래','알찬솔','은새봄',
    '초이슬','풍경아','향미담','달빛솔','별하늘','해바라'];
BEGIN
  -- Program 1: 은퇴 후 자산 관리 (12 total: user1 + 11 others)
  INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
  VALUES ('홍길동', 'user1@woori.com', '1', '은퇴 후 자산 관리 심화 과정', '금융컨설팅', '승인', '2026.03.01', '2026.03.01');
  FOR i IN 1..11 LOOP
    INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
    VALUES (names[i], 'anon' || i || '_p1@woori.com', '1', '은퇴 후 자산 관리 심화 과정', '금융컨설팅', '승인', '2026.03.' || LPAD((i)::TEXT, 2, '0'), '2026.03.' || LPAD((i)::TEXT, 2, '0'));
  END LOOP;

  -- Program 2: 도심형 부동산 (28 total: user1 + user2 + user3 + 25 others)
  INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
  VALUES ('홍길동', 'user1@woori.com', '2', '도심형 소규모 부동산 투자 전략', '부동산', '승인', '2026.03.01', '2026.03.01');
  INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
  VALUES ('김영희', 'user2@woori.com', '2', '도심형 소규모 부동산 투자 전략', '부동산', '승인', '2026.03.02', '2026.03.02');
  INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
  VALUES ('이철수', 'user3@woori.com', '2', '도심형 소규모 부동산 투자 전략', '부동산', '승인', '2026.03.03', '2026.03.03');
  FOR i IN 1..25 LOOP
    INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
    VALUES (names[i + 11], 'anon' || i || '_p2@woori.com', '2', '도심형 소규모 부동산 투자 전략', '부동산', '승인', '2026.03.' || LPAD((i)::TEXT, 2, '0'), '2026.03.' || LPAD((i)::TEXT, 2, '0'));
  END LOOP;

  -- Program 3: 창업 워크숍 (38 total: user3 + 37 others)
  INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
  VALUES ('이철수', 'user3@woori.com', '3', '제2의 인생, 창업 아이디어 워크숍', '창업', '승인', '2026.03.01', '2026.03.01');
  FOR i IN 1..37 LOOP
    INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
    VALUES (names[((i - 1) % 56) + 1], 'anon' || i || '_p3@woori.com', '3', '제2의 인생, 창업 아이디어 워크숍', '창업', '승인', '2026.02.' || LPAD(((i % 28) + 1)::TEXT, 2, '0'), '2026.02.' || LPAD(((i % 28) + 1)::TEXT, 2, '0'));
  END LOOP;

  -- Program 4: 봉사 활동 (56 total: user2 + 55 others)
  INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
  VALUES ('김영희', 'user2@woori.com', '4', '지역 사회 봉사 활동 리더 양성', '사회공헌', '승인', '2026.02.15', '2026.02.15');
  FOR i IN 1..55 LOOP
    INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
    VALUES (names[((i - 1) % 56) + 1], 'anon' || i || '_p4@woori.com', '4', '지역 사회 봉사 활동 리더 양성', '사회공헌', '승인', '2026.02.' || LPAD(((i % 28) + 1)::TEXT, 2, '0'), '2026.02.' || LPAD(((i % 28) + 1)::TEXT, 2, '0'));
  END LOOP;

  -- Program 5: 디지털 금융 (40 total — closed, all completed)
  FOR i IN 1..40 LOOP
    INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
    VALUES (names[((i - 1) % 56) + 1], 'anon' || i || '_p5@woori.com', '5', '디지털 금융 활용 교육 (시니어)', '금융컨설팅', '승인', '2025.12.' || LPAD(((i % 28) + 1)::TEXT, 2, '0'), '2025.12.' || LPAD(((i % 28) + 1)::TEXT, 2, '0'));
  END LOOP;

  -- Program 6: 전문가 매칭 (15 total: user1 + 14 others)
  INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
  VALUES ('홍길동', 'user1@woori.com', '6', '은퇴 전문가 매칭 및 컨설팅', '금융컨설팅', '승인', '2026.03.10', '2026.03.10');
  FOR i IN 1..14 LOOP
    INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date)
    VALUES (names[((i - 1) % 56) + 1], 'anon' || i || '_p6@woori.com', '6', '은퇴 전문가 매칭 및 컨설팅', '금융컨설팅', '승인', '2026.03.' || LPAD((i)::TEXT, 2, '0'), '2026.03.' || LPAD((i)::TEXT, 2, '0'));
  END LOOP;
END $$;

-- Sync programs.applicants to match actual application counts
UPDATE programs SET applicants = (
  SELECT COUNT(*) FROM program_applications
  WHERE program_applications.program_id = CAST(programs.id AS TEXT)
    AND program_applications.status NOT IN ('취소', '반려')
);

-- Consultation Bookings (seed)
INSERT INTO consultation_bookings (user_id, user_name, user_email, date, time, method, status, consultant_id, consultant_name) VALUES
  (4, '홍길동', 'user1@woori.com', '2026.03.10', '10:00', '오프라인', 'completed', 2, '박지영'),
  (6, '이철수', 'user3@woori.com', '2026.03.15', '11:00', '전화', 'completed', 3, '이민호'),
  (4, '홍길동', 'user1@woori.com', '2026.03.20', '14:00', '온라인', 'completed', 2, '박지영')
ON CONFLICT DO NOTHING;
