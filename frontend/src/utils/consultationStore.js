/**
 * Shared localStorage store for consultation bookings, intake forms, and history.
 * Used by user booking, admin assignment, and consultant views.
 */

const BOOKINGS_KEY = 'woori_consultation_bookings';
const INTAKE_KEY = 'woori_intake_forms';
const AVAILABILITY_KEY = 'woori_instructor_availability';
const NOTES_KEY = 'woori_consultation_notes';

// ── KST (UTC+9) date helpers ──
export const getKSTDate = () => {
  const now = new Date();
  const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
  return kst;
};

export const formatKSTDate = (d) => {
  const kst = d || getKSTDate();
  return `${kst.getFullYear()}.${String(kst.getMonth() + 1).padStart(2, '0')}.${String(kst.getDate()).padStart(2, '0')}`;
};

export const getKSTToday = () => formatKSTDate();

// ── System consultants (matches AuthContext) ──
export const CONSULTANTS = [
  { id: 2, name_ko: '박지영', email: 'instructor1@woori.com', department: '전직지원팀' },
  { id: 3, name_ko: '이민호', email: 'instructor2@woori.com', department: '전직지원팀' },
];

// ── Available time slots ──
export const getAvailableSlots = (dateStr) => {
  const d = new Date(dateStr.replace(/\./g, '-'));
  const day = d.getDay();
  if (day === 0 || day === 6) return []; // weekends
  const slots = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
};

export const getBookedSlots = (dateStr) => {
  const bookings = loadBookings();
  return bookings
    .filter((b) => b.date === dateStr && b.status !== 'cancelled')
    .map((b) => b.time);
};

// ── Seed data ──
const SEED_BOOKINGS = [
  {
    id: 1, userId: 4, userName: '홍길동', userEmail: 'user1@woori.com',
    date: '2026.03.10', time: '10:00', method: '오프라인',
    status: 'completed', consultantId: 2, consultantName: '박지영',
    createdAt: '2026.03.08',
  },
  {
    id: 2, userId: 6, userName: '이철수', userEmail: 'user3@woori.com',
    date: '2026.03.15', time: '11:00', method: '전화',
    status: 'completed', consultantId: 3, consultantName: '이민호',
    createdAt: '2026.03.13',
  },
  {
    id: 3, userId: 4, userName: '홍길동', userEmail: 'user1@woori.com',
    date: '2026.03.20', time: '14:00', method: '온라인',
    status: 'completed', consultantId: 2, consultantName: '박지영',
    createdAt: '2026.03.18',
  },
  {
    id: 4, userId: 5, userName: '김영희', userEmail: 'user2@woori.com',
    date: '2026.03.28', time: '10:00', method: '오프라인',
    status: 'pending', consultantId: null, consultantName: null,
    createdAt: '2026.03.25',
  },
  {
    id: 5, userId: 6, userName: '이철수', userEmail: 'user3@woori.com',
    date: '2026.04.02', time: '15:00', method: '전화',
    status: 'pending', consultantId: null, consultantName: null,
    createdAt: '2026.03.25',
  },
  {
    id: 6, userId: 4, userName: '홍길동', userEmail: 'user1@woori.com',
    date: '2026.03.27', time: '14:00', method: '온라인',
    status: 'confirmed', consultantId: 2, consultantName: '박지영',
    createdAt: '2026.03.24',
  },
];

const SEED_INTAKE = {
  4: {
    name: '홍길동', birthYear: '1968', residence: '서울시 강남구', gender: '남성',
    company: '우리은행', lastRank: '부장', tenureYears: '28', tenureMonths: '3',
    education: '대졸', retirementType: '희망퇴직',
    retirementDate: '2026-01-15', currentStatus: '진로 고민 단계',
    psychologicalState: ['방향성 혼란', '경제적 부담'],
    currentSituation: '28년간 금융컨설팅 업무를 수행하였으며, 퇴직 후 새로운 진로를 탐색하고 있습니다.',
    mainDuties: '자산관리, 투자상담, 고객관리, VIP 포트폴리오 운용',
    longestRole: '자산관리',
    strengths: ['고객 커뮤니케이션', '금융상품 분석', '포트폴리오 설계'],
    managementExp: '있음', managementSize: '12',
    certifications: 'CFP, 투자자산운용사',
    digitalLevel: '보통',
    desiredCareer: ['재취업 (정규·계약직)', '프리랜서 / 컨설팅'],
    desiredField: '금융 컨설팅, 자산관리',
    desiredWorkType: '정규직',
    desiredRegion: '서울/경기',
    desiredTiming: '3개월 내',
    desiredIncome: '500', minimumIncome: '350',
    workHours: '풀타임', travelAvailability: '가능',
    resumeStatus: '이력서 있음 (업데이트 필요)',
    difficulties: ['정보 부족', '연령 장벽 우려'],
    motivationLevel: 4,
    familySupport: '적극 지지', healthStatus: '양호',
    expectations: ['취업 연계', '진로 설계·탐색'],
    preferredMethod: ['1:1 개인 상담', '온라인 진행'],
    additionalRequests: '',
    consultantDiagnosisLevel: 'B',
    consultantRisks: '연령에 대한 우려가 있으나 경력 역량은 충분. 디지털 역량 보완 필요.',
    recommendedTracks: ['재취업 집중 트랙', '교육·재훈련 트랙'],
    nextGoals: '이력서 업데이트 및 희망 기업 리스트 작성',
    consultantName: '박지영',
    updatedAt: '2026-03-20T10:30:00',
  },
};

// ── Bookings CRUD ──

export const loadBookings = () => {
  try {
    const saved = localStorage.getItem(BOOKINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  saveBookings(SEED_BOOKINGS);
  return SEED_BOOKINGS;
};

export const saveBookings = (bookings) => {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const getBookingById = (id) => {
  return loadBookings().find((b) => b.id === id) || null;
};

export const addBooking = (booking) => {
  const bookings = loadBookings();
  const newBooking = {
    ...booking,
    id: Math.max(0, ...bookings.map((b) => b.id)) + 1,
    status: 'pending',
    consultantId: null,
    consultantName: null,
    createdAt: formatKSTDate(),
  };
  bookings.push(newBooking);
  saveBookings(bookings);
  return newBooking;
};

export const assignConsultant = (bookingId, consultantId, consultantName) => {
  const bookings = loadBookings();
  const updated = bookings.map((b) =>
    b.id === bookingId
      ? { ...b, consultantId, consultantName, status: 'pending_approval' }
      : b
  );
  saveBookings(updated);
};

export const approveBooking = (bookingId) => {
  const bookings = loadBookings();
  const updated = bookings.map((b) =>
    b.id === bookingId ? { ...b, status: 'confirmed' } : b
  );
  saveBookings(updated);
};

export const completeBooking = (bookingId) => {
  const bookings = loadBookings();
  const updated = bookings.map((b) =>
    b.id === bookingId ? { ...b, status: 'completed' } : b
  );
  saveBookings(updated);
};

export const cancelBooking = (bookingId) => {
  const bookings = loadBookings();
  const updated = bookings.map((b) =>
    b.id === bookingId ? { ...b, status: 'cancelled' } : b
  );
  saveBookings(updated);
};

// ── Query helpers ──

export const getBookingsForUser = (userId) => {
  return loadBookings().filter((b) => b.userId === userId && b.status !== 'cancelled');
};

export const getBookingsForConsultant = (consultantId) => {
  return loadBookings().filter((b) => b.consultantId === consultantId && b.status !== 'cancelled');
};

export const getPendingBookings = () => {
  return loadBookings().filter((b) => b.status === 'pending');
};

export const getConsultationHistory = (userId, consultantId) => {
  return loadBookings().filter(
    (b) => b.status === 'completed' &&
      (!userId || b.userId === userId) &&
      (!consultantId || b.consultantId === consultantId)
  );
};

// ── Intake Forms ──

export const loadIntakeForms = () => {
  try {
    const saved = localStorage.getItem(INTAKE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  saveIntakeForms(SEED_INTAKE);
  return SEED_INTAKE;
};

export const saveIntakeForms = (forms) => {
  localStorage.setItem(INTAKE_KEY, JSON.stringify(forms));
};

export const getIntakeForm = (userId) => {
  const forms = loadIntakeForms();
  return forms[userId] || null;
};

export const saveIntakeForm = (userId, data) => {
  const forms = loadIntakeForms();
  forms[userId] = { ...data, updatedAt: new Date().toISOString() };
  saveIntakeForms(forms);
};

export const hasIntakeForm = (userId) => {
  return !!getIntakeForm(userId);
};

// ── Stats helpers (for dashboard) ──

export const getConsultationStats = () => {
  const bookings = loadBookings();
  const active = bookings.filter((b) => b.status !== 'cancelled');
  return {
    total: active.length,
    pending: active.filter((b) => b.status === 'pending').length,
    pending_approval: active.filter((b) => b.status === 'pending_approval').length,
    confirmed: active.filter((b) => b.status === 'confirmed').length,
    completed: active.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };
};

export const getConsultantStats = () => {
  const bookings = loadBookings().filter((b) => b.status !== 'cancelled');
  const byConsultant = {};
  CONSULTANTS.forEach((c) => {
    const mine = bookings.filter((b) => b.consultantId === c.id);
    byConsultant[c.id] = {
      ...c,
      total: mine.length,
      completed: mine.filter((b) => b.status === 'completed').length,
      confirmed: mine.filter((b) => b.status === 'confirmed').length,
      online: mine.filter((b) => b.method === '온라인').length,
      offline: mine.filter((b) => b.method === '오프라인').length,
      phone: mine.filter((b) => b.method === '전화').length,
      users: [...new Set(mine.map((b) => b.userId))],
    };
  });
  return byConsultant;
};

// ── Instructor Availability ──
// Structure: { [instructorId]: { slots: { [dateStr]: ['09:00','09:30',...] }, sessionDuration: 30, repeatMode: 'none' } }

// Generate seed availability for the current and next month (weekdays 9-17)
const generateSeedSlots = (startH, endH) => {
  const slots = [];
  for (let h = startH; h < endH; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
};

const buildSeedAvailability = () => {
  const result = {};
  const kstNow = getKSTDate();
  for (let offset = 0; offset <= 30; offset++) {
    const d = new Date(kstNow); d.setDate(d.getDate() + offset);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    result[formatKSTDate(d)] = generateSeedSlots(9, 17);
  }
  return result;
};

const SEED_AVAILABILITY = {
  2: { slots: buildSeedAvailability(), sessionDuration: 30 },
  3: { slots: buildSeedAvailability(), sessionDuration: 30 },
};

export const loadAvailability = () => {
  try {
    const saved = localStorage.getItem(AVAILABILITY_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  saveAvailability(SEED_AVAILABILITY);
  return SEED_AVAILABILITY;
};

export const saveAvailability = (data) => {
  localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(data));
};

export const getInstructorAvailability = (instructorId, dateStr) => {
  const all = loadAvailability();
  return all[instructorId]?.slots?.[dateStr] || [];
};

export const getInstructorSessionDuration = (instructorId) => {
  const all = loadAvailability();
  return all[instructorId]?.sessionDuration || 30;
};

export const setInstructorAvailability = (instructorId, dateStr, slots) => {
  const all = loadAvailability();
  if (!all[instructorId]) all[instructorId] = { slots: {}, sessionDuration: 30 };
  if (!all[instructorId].slots) all[instructorId].slots = {};
  all[instructorId].slots[dateStr] = slots;
  saveAvailability(all);
};

export const setInstructorSessionDuration = (instructorId, duration) => {
  const all = loadAvailability();
  if (!all[instructorId]) all[instructorId] = { slots: {}, sessionDuration: duration };
  else all[instructorId].sessionDuration = duration;
  saveAvailability(all);
};

// Copy one day's availability to a range of dates
export const copyAvailabilityToRange = (instructorId, sourceDate, targetDates) => {
  const all = loadAvailability();
  if (!all[instructorId]?.slots?.[sourceDate]) return;
  const sourceSlots = all[instructorId].slots[sourceDate];
  targetDates.forEach((d) => { all[instructorId].slots[d] = [...sourceSlots]; });
  saveAvailability(all);
};

export const getAvailableInstructorsForSlot = (dateStr, timeStr) => {
  const all = loadAvailability();
  const booked = loadBookings().filter(
    (b) => b.date === dateStr && b.time === timeStr && b.status !== 'cancelled'
  );
  const bookedInstructorIds = booked.map((b) => b.consultantId);

  return CONSULTANTS.filter((c) => {
    const slots = all[c.id]?.slots?.[dateStr] || [];
    return slots.includes(timeStr) && !bookedInstructorIds.includes(c.id);
  });
};

// ── Consultation Notes (per booking) ──
// Structure: { [bookingId]: { title: '', content: '', updatedAt: '' } }

export const loadNotes = () => {
  try {
    const saved = localStorage.getItem(NOTES_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {};
};

export const getNote = (bookingId) => {
  return loadNotes()[bookingId] || null;
};

export const saveNote = (bookingId, title, content) => {
  const all = loadNotes();
  all[bookingId] = { title, content, updatedAt: new Date().toISOString() };
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
};

// ── Reset all data (for fresh start) ──
export const resetAllConsultationData = () => {
  localStorage.removeItem(BOOKINGS_KEY);
  localStorage.removeItem(INTAKE_KEY);
  localStorage.removeItem(AVAILABILITY_KEY);
  localStorage.removeItem(NOTES_KEY);
};
