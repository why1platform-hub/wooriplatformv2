-- ═══ CREATE USERS TABLE ═══

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT 'demo1234',
  name_ko TEXT NOT NULL DEFAULT '',
  name_en TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('admin', 'consultant', 'learner', 'hr_manager')),
  department TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  employee_id TEXT DEFAULT '',
  birth_date TEXT DEFAULT '',
  retirement_date TEXT DEFAULT '',
  address TEXT DEFAULT '',
  skills TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  created_at TEXT DEFAULT to_char(now(), 'YYYY.MM.DD'),
  last_login TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (demo app — tighten for production)
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);

-- ═══ SEED ADMIN + CONSULTANTS ═══

INSERT INTO users (id, email, password, name_ko, name_en, role, department, status)
VALUES
  (1, 'admin@woori.com', 'admin1234', '관리자', 'Admin', 'admin', '시스템관리팀', 'active'),
  (2, 'instructor1@woori.com', 'demo1234', '박지영', 'Park Jiyoung', 'consultant', '전직지원팀', 'active'),
  (3, 'instructor2@woori.com', 'demo1234', '이민호', 'Lee Minho', 'consultant', '전직지원팀', 'active')
ON CONFLICT (email) DO NOTHING;

-- Reset sequence to avoid ID conflicts
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users));
