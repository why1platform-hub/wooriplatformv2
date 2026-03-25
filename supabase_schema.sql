-- Woori Platform — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- ─── Site Config (branding, banners, settings) ───
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Consultation Bookings ───
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

-- ─── Consultation Notes (per booking) ───
CREATE TABLE IF NOT EXISTS consultation_notes (
  booking_id INT PRIMARY KEY REFERENCES consultation_bookings(id),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Intake Forms (per user) ───
CREATE TABLE IF NOT EXISTS intake_forms (
  user_id INT PRIMARY KEY,
  form_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Instructor Availability ───
CREATE TABLE IF NOT EXISTS instructor_availability (
  id SERIAL PRIMARY KEY,
  instructor_id INT NOT NULL,
  date TEXT NOT NULL,
  slots JSONB NOT NULL DEFAULT '[]',
  session_duration INT NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instructor_id, date)
);

-- ─── Program Applications ───
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

-- ─── Enable Row Level Security (allow all for now — anon key) ───
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_applications ENABLE ROW LEVEL SECURITY;

-- Policies: allow full access via anon key (demo mode)
CREATE POLICY "Allow all" ON site_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON consultation_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON consultation_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON intake_forms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON instructor_availability FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON program_applications FOR ALL USING (true) WITH CHECK (true);

-- ─── Seed site config ───
INSERT INTO site_config (key, value) VALUES
  ('branding', '{"title_ko": "우리은행 퇴직 컨시어지 서비스", "title_en": "Woori Bank Retirement Concierge Service", "title_short_ko": "퇴직 컨시어지", "title_short_en": "Retirement Concierge"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ─── Seed bookings ───
INSERT INTO consultation_bookings (user_id, user_name, user_email, date, time, method, status, consultant_id, consultant_name) VALUES
  (4, '홍길동', 'user1@woori.com', '2026.03.10', '10:00', '오프라인', 'completed', 2, '박지영'),
  (6, '이철수', 'user3@woori.com', '2026.03.15', '11:00', '전화', 'completed', 3, '이민호'),
  (4, '홍길동', 'user1@woori.com', '2026.03.20', '14:00', '온라인', 'completed', 2, '박지영')
ON CONFLICT DO NOTHING;

-- ─── Seed program applications ───
INSERT INTO program_applications (user_name, email, program_id, program_title, category, status, applied_at, date) VALUES
  ('홍길동', 'user1@woori.com', '1', '은퇴 후 자산 관리 심화 과정', '금융컨설팅', '승인대기', '2026.03.20', '2026.03.20'),
  ('김영희', 'user2@woori.com', '2', '도심형 소규모 부동산 투자 전략', '부동산', '승인대기', '2026.03.19', '2026.03.19'),
  ('이철수', 'user3@woori.com', '3', '제2의 인생, 창업 아이디어 워크숍', '창업', '승인대기', '2026.03.18', '2026.03.18'),
  ('홍길동', 'user1@woori.com', '6', '은퇴 전문가 매칭 및 컨설팅', '금융컨설팅', '승인', '2026.03.15', '2026.03.15'),
  ('김영희', 'user2@woori.com', '4', '지역 사회 봉사 활동 리더 양성', '사회공헌', '승인', '2026.03.16', '2026.03.16')
ON CONFLICT DO NOTHING;
