-- Woori Platform — Migration V2: Programs + Banners
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- ─── Programs ───
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

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON programs FOR ALL USING (true) WITH CHECK (true);

-- Seed programs
INSERT INTO programs (id, title_ko, category, status, start_date, end_date, applicants, capacity, description, location, instructor) VALUES
  (1, '은퇴 후 자산 관리 심화 과정', '금융컨설팅', '모집중', '2026.04.01', '2026.06.30', 12, 30, '은퇴를 앞두고 있거나 이미 은퇴한 분들을 위한 자산 관리 심화 프로그램입니다.', '우리은행 본점 교육관', '김재무 전문위원'),
  (2, '도심형 소규모 부동산 투자 전략', '부동산', '모집중', '2026.04.10', '2026.05.31', 28, 35, '부동산 투자의 기초부터 고급 전략까지 배웁니다.', '우리은행 강남 교육센터', '박부동 컨설턴트'),
  (3, '제2의 인생, 창업 아이디어 워크숍', '창업', '마감예정', '2026.03.25', '2026.04.20', 38, 40, '퇴직 후 창업을 꿈꾸는 시니어를 위한 실전 프로그램입니다.', '우리은행 본점 세미나실', '이창업 대표'),
  (4, '지역 사회 봉사 활동 리더 양성', '사회공헌', '진행중', '2026.03.01', '2026.08.31', 56, 100, '지역 사회에 기여할 수 있는 봉사 프로그램입니다.', '각 지역 센터', '정봉사 위원'),
  (5, '디지털 금융 활용 교육 (시니어)', '금융컨설팅', '종료', '2025.12.25', '2026.01.15', 40, 40, '디지털 금융 서비스 활용법을 배웁니다.', '온라인', '최디지털 강사'),
  (6, '은퇴 전문가 매칭 및 컨설팅', '금융컨설팅', '모집중', '2026.04.08', '2026.05.28', 15, 30, '전문가 매칭을 통한 맞춤 컨설팅 프로그램입니다.', '우리은행 본점', '강매칭 팀장')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to avoid ID conflicts
SELECT setval('programs_id_seq', (SELECT COALESCE(MAX(id), 0) FROM programs));
