/**
 * Course & material data store — Supabase-backed.
 * Falls back to localStorage, then mock data.
 */

import { supabase } from './supabase';

const COURSES_KEY = 'woori_courses_published';
const MATERIALS_KEY = 'woori_materials_published';
const PROGRESS_KEY = 'woori_course_progress';

// ── Mock data (hardcoded fallback) ──

const MOCK_COURSES = [
  {
    id: 'mock-1',
    title: '디지털 금융 트렌드 2026',
    category: '금융컨설팅',
    instructor: '김재현 컨설턴트',
    duration: '45:00',
    views: 1234,
    created_at: '2026.03.15',
    thumbnail: '',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: '게시중',
    description: '2026년 디지털 금융의 최신 트렌드를 알아봅니다.',
    lessons: [
      { id: 'l1', title: '1강. 디지털 금융 개요', duration: '15:00', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { id: 'l2', title: '2강. AI 기반 자산관리', duration: '15:00', video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
      { id: 'l3', title: '3강. 디지털 뱅킹의 미래', duration: '15:00', video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0' },
    ],
  },
  {
    id: 'mock-2',
    title: '시니어를 위한 AI 활용법',
    category: '기타',
    instructor: '박지영 컨설턴트',
    duration: '38:20',
    views: 892,
    created_at: '2026.03.10',
    thumbnail: '',
    video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    status: '게시중',
    description: '시니어 세대를 위한 AI 활용 가이드입니다.',
    lessons: [
      { id: 'l1', title: '1강. AI란 무엇인가?', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
      { id: 'l2', title: '2강. ChatGPT 활용하기', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk' },
      { id: 'l3', title: '3강. AI 이미지 생성', duration: '13:20', video_url: 'https://www.youtube.com/watch?v=RgKAFK5djSk' },
    ],
  },
  {
    id: 'mock-3',
    title: '부동산 투자 기초 가이드',
    category: '부동산',
    instructor: '이민호 컨설턴트',
    duration: '52:10',
    views: 2156,
    created_at: '2026.02.28',
    thumbnail: '',
    video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    status: '게시중',
    description: '부동산 투자의 기본부터 실전까지.',
    lessons: [
      { id: 'l1', title: '1강. 부동산 시장 이해', duration: '17:00', video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0' },
      { id: 'l2', title: '2강. 투자 유형별 분석', duration: '18:00', video_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8' },
      { id: 'l3', title: '3강. 리스크 관리', duration: '17:10', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    ],
  },
  {
    id: 'mock-4',
    title: '성공적인 창업 전략',
    category: '창업',
    instructor: '김재현 컨설턴트',
    duration: '41:30',
    views: 1567,
    created_at: '2026.02.20',
    thumbnail: '',
    video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    status: '게시중',
    description: '시니어 창업의 A to Z.',
    lessons: [
      { id: 'l1', title: '1강. 창업 아이디어 발굴', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk' },
      { id: 'l2', title: '2강. 사업 계획서 작성', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=RgKAFK5djSk' },
      { id: 'l3', title: '3강. 자금 확보 전략', duration: '13:30', video_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8' },
    ],
  },
  {
    id: 'mock-5',
    title: '자산관리와 은퇴 설계',
    category: '금융컨설팅',
    instructor: '박지영 컨설턴트',
    duration: '35:45',
    views: 3421,
    created_at: '2026.02.15',
    thumbnail: '',
    video_url: 'https://www.youtube.com/watch?v=RgKAFK5djSk',
    status: '게시중',
    description: '체계적인 자산관리와 은퇴 설계 방법을 배웁니다.',
    lessons: [
      { id: 'l1', title: '1강. 은퇴 자금 계획', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=RgKAFK5djSk' },
      { id: 'l2', title: '2강. 연금과 보험 설계', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { id: 'l3', title: '3강. 투자 포트폴리오', duration: '11:45', video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
    ],
  },
  {
    id: 'mock-6',
    title: '사회공헌 활동 시작하기',
    category: '사회공헌',
    instructor: '이민호 컨설턴트',
    duration: '28:15',
    views: 678,
    created_at: '2026.02.10',
    thumbnail: '',
    video_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    status: '게시중',
    description: '은퇴 후 보람찬 사회공헌 활동을 시작하는 방법을 안내합니다.',
    lessons: [
      { id: 'l1', title: '1강. 사회공헌 분야 탐색', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8' },
      { id: 'l2', title: '2강. 봉사활동 참여하기', duration: '14:15', video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0' },
    ],
  },
];

const MOCK_MATERIALS = [
  { id: 'mat-1', title: '2026 은퇴설계 가이드북', category: '금융컨설팅', file_type: 'pdf', file_size: '2.4MB', download_count: 456, file_url: '#' },
  { id: 'mat-2', title: '부동산 투자 체크리스트', category: '부동산', file_type: 'xlsx', file_size: '1.1MB', download_count: 312, file_url: '#' },
  { id: 'mat-3', title: '창업 사업계획서 템플릿', category: '창업', file_type: 'docx', file_size: '890KB', download_count: 234, file_url: '#' },
];

// ── Sync helpers for initial render ──

export const loadCoursesSync = () => {
  try {
    const saved = localStorage.getItem(COURSES_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
};

export const cacheCourses = (courses) => {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

// ── Courses CRUD ──

export const getAllCourses = async () => {
  // 1. Try Supabase
  try {
    const { data, error } = await supabase.from('courses').select('*').order('id');
    if (!error && data && data.length > 0) {
      cacheCourses(data);
      return data;
    }
  } catch { /* fallback */ }
  // 2. Fallback to localStorage
  try {
    const saved = localStorage.getItem(COURSES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  // 3. Mock data
  return MOCK_COURSES;
};

export const getPublishedCourses = async () => {
  const all = await getAllCourses();
  return all.filter((c) => c.status === '게시중');
};

export const getCourseById = async (id) => {
  try {
    const { data } = await supabase.from('courses').select('*').eq('id', String(id)).single();
    if (data) return data;
  } catch { /* fallback */ }
  const all = await getAllCourses();
  return all.find((c) => String(c.id) === String(id)) || null;
};

export const saveCourses = async (courses) => {
  // Upsert each course to Supabase individually
  for (const c of courses) {
    try {
      // Only send fields that exist in the Supabase schema
      const row = {
        id: String(c.id),
        title: c.title || '',
        category: c.category || '',
        instructor: c.instructor || '',
        duration: c.duration || '',
        views: c.views || 0,
        created_at: c.created_at || '',
        thumbnail: c.thumbnail || '',
        video_url: c.video_url || '',
        status: c.status || '게시중',
        description: c.description || '',
        lessons: c.lessons || [],
        enrollments: c.enrollments || 0,
      };
      const { error } = await supabase.from('courses').upsert(row);
      if (error) console.error('saveCourses upsert error:', c.id, error.message);
    } catch (e) {
      console.error('saveCourses exception:', c.id, e);
    }
  }
  // Also cache in localStorage
  cacheCourses(courses);
};

export const addCourse = async (course) => {
  const newCourse = { ...course, id: course.id || `course-${Date.now()}` };
  try {
    const { data } = await supabase.from('courses').insert(newCourse).select().single();
    if (data) return data;
  } catch { /* ignore */ }
  // Fallback: save to localStorage
  const existing = loadCoursesSync();
  existing.unshift(newCourse);
  cacheCourses(existing);
  return newCourse;
};

export const updateCourse = async (id, updates) => {
  try {
    await supabase.from('courses').update(updates).eq('id', String(id));
  } catch { /* ignore */ }
  // Also update localStorage cache
  const all = loadCoursesSync();
  const updated = all.map((c) => (String(c.id) === String(id) ? { ...c, ...updates } : c));
  cacheCourses(updated);
};

export const deleteCourse = async (id) => {
  try {
    await supabase.from('courses').delete().eq('id', String(id));
  } catch { /* ignore */ }
  // Also update localStorage cache
  const all = loadCoursesSync();
  const filtered = all.filter((c) => String(c.id) !== String(id));
  cacheCourses(filtered);
};

// ── Materials CRUD ──

export const getAllMaterials = async () => {
  // 1. Try Supabase
  try {
    const { data, error } = await supabase.from('materials').select('*').order('id');
    if (!error && data && data.length > 0) {
      localStorage.setItem(MATERIALS_KEY, JSON.stringify(data));
      return data;
    }
  } catch { /* fallback */ }
  // 2. Fallback to localStorage
  try {
    const saved = localStorage.getItem(MATERIALS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  // 3. Mock data
  return MOCK_MATERIALS;
};

// ── Progress tracking (localStorage per-user) ──

const getProgressMap = () => {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {};
};

const saveProgressMap = (map) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
};

// Get progress for a course: { completedLessons: ['l1','l2'], progress: 66 }
export const getCourseProgress = (courseId) => {
  const map = getProgressMap();
  return map[String(courseId)] || { completedLessons: [], progress: 0 };
};

// Mark a lesson as completed
export const markLessonCompleted = (courseId, lessonId) => {
  const map = getProgressMap();
  const key = String(courseId);
  // Use sync cache for lesson count (progress is local-only)
  const allCached = loadCoursesSync();
  const course = allCached.find((c) => String(c.id) === key) || MOCK_COURSES.find((c) => String(c.id) === key);
  if (!course) return;

  const entry = map[key] || { completedLessons: [] };
  if (!entry.completedLessons.includes(lessonId)) {
    entry.completedLessons.push(lessonId);
  }
  const totalLessons = course.lessons?.length || 1;
  entry.progress = Math.round((entry.completedLessons.length / totalLessons) * 100);
  map[key] = entry;
  saveProgressMap(map);
  return entry;
};

// Get all courses with progress > 0 (for "recent learning" sidebar)
export const getInProgressCourses = async () => {
  const map = getProgressMap();
  const all = await getAllCourses();
  return all
    .map((c) => {
      const p = map[String(c.id)];
      return p && p.progress > 0 && p.progress < 100 ? { ...c, progress: p.progress } : null;
    })
    .filter(Boolean);
};
