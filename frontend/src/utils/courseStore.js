/**
 * Course & material data store — Supabase-backed.
 * Falls back to localStorage, then mock data.
 */

import { supabase } from './supabase';

const COURSES_KEY = 'woori_courses_published';
const MATERIALS_KEY = 'woori_materials_published';
const PROGRESS_KEY = 'woori_course_progress';

// ── Mock data (hardcoded fallback) ──

const MOCK_COURSES = [];

const MOCK_MATERIALS = [];

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
