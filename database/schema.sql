-- Woori Bank Retired Employee Support Platform Database Schema
-- PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'learner', 'hr_manager');

-- User status enum
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name_ko VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    role user_role DEFAULT 'learner',
    status user_status DEFAULT 'active',
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    retirement_date DATE,
    profile_image VARCHAR(500),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    preferred_language VARCHAR(10) DEFAULT 'ko',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PROGRAMS & APPLICATIONS
-- =====================================================

-- Program categories enum
CREATE TYPE program_category AS ENUM ('금융컨설팅', '부동산', '창업', '사회공헌', '건강', '디지털', '여가');

-- Program status enum
CREATE TYPE program_status AS ENUM ('모집중', '마감예정', '종료', '진행중');

-- Programs table
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ko VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    description_ko TEXT,
    description_en TEXT,
    category program_category NOT NULL,
    status program_status DEFAULT '모집중',
    recruitment_start DATE NOT NULL,
    recruitment_end DATE NOT NULL,
    program_start DATE,
    program_end DATE,
    max_participants INTEGER DEFAULT 30,
    current_participants INTEGER DEFAULT 0,
    location VARCHAR(200),
    instructor_id UUID REFERENCES users(id),
    requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Application status enum
CREATE TYPE application_status AS ENUM ('승인대기', '승인완료', '진행중', '완료', '취소');

-- Program applications table
CREATE TABLE program_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    status application_status DEFAULT '승인대기',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    UNIQUE(user_id, program_id)
);

-- =====================================================
-- CONSULTATIONS
-- =====================================================

-- Consultation status enum
CREATE TYPE consultation_status AS ENUM ('예약됨', '완료', '취소', '노쇼');

-- Consultations table
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES users(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status consultation_status DEFAULT '예약됨',
    topic VARCHAR(200),
    summary TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- LEARNING & COURSES
-- =====================================================

-- Course type enum
CREATE TYPE course_type AS ENUM ('video', 'document', 'quiz');

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ko VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    description_ko TEXT,
    description_en TEXT,
    category program_category,
    type course_type DEFAULT 'video',
    duration_minutes INTEGER,
    thumbnail_url VARCHAR(500),
    video_url VARCHAR(500),
    document_url VARCHAR(500),
    file_size VARCHAR(20),
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course enrollment/progress table
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- =====================================================
-- JOB INFORMATION
-- =====================================================

-- Employment type enum
CREATE TYPE employment_type AS ENUM ('정규직', '계약직', '프리랜서', '파트타임');

-- Job category enum
CREATE TYPE job_category AS ENUM ('금융', '부동산', '컨설팅', '사회공헌', '기타');

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    title_ko VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    description_ko TEXT,
    description_en TEXT,
    category job_category,
    employment_type employment_type,
    location VARCHAR(200),
    salary_range VARCHAR(100),
    requirements TEXT,
    benefits TEXT,
    contact_info VARCHAR(200),
    external_url VARCHAR(500),
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0
);

-- Job bookmarks table
CREATE TABLE job_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- Job applications table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    resume_id UUID,
    cover_letter TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'submitted'
);

-- User resumes table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content JSONB,
    file_url VARCHAR(500),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANNOUNCEMENTS & NOTIFICATIONS
-- =====================================================

-- Announcement type enum
CREATE TYPE announcement_type AS ENUM ('긴급', '안내', '일반');

-- Announcement display type enum
CREATE TYPE announcement_display AS ENUM ('modal', 'banner', 'toast', 'list');

-- Announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ko VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    content_ko TEXT,
    content_en TEXT,
    type announcement_type DEFAULT '일반',
    display_type announcement_display DEFAULT 'list',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    target_roles user_role[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User announcement read status
CREATE TABLE announcement_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dismissed BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, announcement_id)
);

-- =====================================================
-- COMMUNITY & Q&A
-- =====================================================

-- Q&A Questions table
CREATE TABLE qa_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    view_count INTEGER DEFAULT 0,
    is_answered BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Q&A Answers table
CREATE TABLE qa_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES qa_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FAQ
-- =====================================================

-- FAQ categories
CREATE TABLE faq_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ko VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    sort_order INTEGER DEFAULT 0
);

-- FAQ items
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES faq_categories(id) ON DELETE SET NULL,
    question_ko TEXT NOT NULL,
    question_en TEXT,
    answer_ko TEXT NOT NULL,
    answer_en TEXT,
    sort_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 1:1 INQUIRIES
-- =====================================================

-- Inquiry status enum
CREATE TYPE inquiry_status AS ENUM ('대기중', '처리중', '완료');

-- Inquiries table
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100),
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    status inquiry_status DEFAULT '대기중',
    response TEXT,
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CALENDAR & SCHEDULES
-- =====================================================

-- Event type enum
CREATE TYPE event_type AS ENUM ('program', 'consultation', 'course', 'deadline', 'other');

-- Calendar events table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title_ko VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    description TEXT,
    event_type event_type,
    related_id UUID,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    is_all_day BOOLEAN DEFAULT FALSE,
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SKILLS & ASSESSMENTS
-- =====================================================

-- Skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ko VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    category VARCHAR(100),
    description TEXT
);

-- User skills table
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, skill_id)
);

-- Assessments/Quizzes table
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ko VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    description TEXT,
    skill_id UUID REFERENCES skills(id),
    passing_score INTEGER DEFAULT 70,
    time_limit_minutes INTEGER,
    questions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment attempts table
CREATE TABLE assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    answers JSONB,
    score INTEGER,
    passed BOOLEAN,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_category ON programs(category);
CREATE INDEX idx_program_applications_user ON program_applications(user_id);
CREATE INDEX idx_program_applications_status ON program_applications(status);
CREATE INDEX idx_consultations_user ON consultations(user_id);
CREATE INDEX idx_consultations_scheduled ON consultations(scheduled_at);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_qa_questions_user ON qa_questions(user_id);
CREATE INDEX idx_faqs_category ON faqs(category_id);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert FAQ categories
INSERT INTO faq_categories (name_ko, name_en, sort_order) VALUES
('프로그램 신청', 'Program Application', 1),
('상담 서비스', 'Consultation Service', 2),
('학습자료', 'Learning Materials', 3),
('채용정보', 'Job Information', 4),
('계정 관리', 'Account Management', 5);

-- Insert sample skills
INSERT INTO skills (name_ko, name_en, category) VALUES
('금융 컨설팅', 'Financial Consulting', '금융'),
('자산 관리', 'Asset Management', '금융'),
('부동산 투자', 'Real Estate Investment', '부동산'),
('창업 기획', 'Startup Planning', '창업'),
('사회공헌 활동', 'Social Contribution', '사회공헌'),
('디지털 리터러시', 'Digital Literacy', '디지털');
