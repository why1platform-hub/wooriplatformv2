import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Tabs, Tab, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Collapse,
  ToggleButton, ToggleButtonGroup, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Checkbox, Radio, RadioGroup, FormGroup,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CheckCircle as ApproveIcon,
  Videocam as OnlineIcon,
  LocationOn as OfflineIcon,
  Phone as PhoneIcon,
  Description as FormIcon,
  History as HistoryIcon,
  PersonAdd as AssignIcon,
  Done as DoneIcon,
  Schedule as ClockIcon,
  ChevronLeft, ChevronRight,
  ContentCopy as CopyIcon,
  StickyNote2 as NoteIcon,
  Search as SearchIcon,
  HowToReg as AcceptIcon,
  Visibility as ViewNoteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  loadBookings, assignConsultant, approveBooking, completeBooking, rejectBooking,
  getConsultationStats, getConsultantStats,
  getConsultationHistory, CONSULTANTS,
  getAvailableInstructorsForSlot,
  getInstructorAvailability, setInstructorAvailability,
  getInstructorSessionDuration, setInstructorSessionDuration,
  copyAvailabilityToRange, getNote, saveNote,
  getKSTDate, formatKSTDate,
} from '../../utils/consultationStore';
import IntakeForm from '../consultations/IntakeForm';
import { pushUserNotification } from '../../utils/notificationHelper';

const statusConfig = {
  pending: { label: '배정 대기', color: '#92400E', bg: '#FEF3C7' },
  pending_approval: { label: '승인 대기', color: '#7C3AED', bg: '#F3F0FF' },
  proposed: { label: '상담 제안', color: '#0369A1', bg: '#E0F2FE' },
  confirmed: { label: '확정', color: '#1E40AF', bg: '#DBEAFE' },
  completed: { label: '완료', color: '#166534', bg: '#DCFCE7' },
  cancelled: { label: '취소', color: '#991B1B', bg: '#FEE2E2' },
  rejected: { label: '거절', color: '#C62828', bg: '#FFEBEE' },
};
const methodIcon = { '온라인': <OnlineIcon sx={{ fontSize: 16 }} />, '오프라인': <OfflineIcon sx={{ fontSize: 16 }} />, '전화': <PhoneIcon sx={{ fontSize: 16 }} /> };

// ─── Calendar helper ───
const getMonthDays = (year, month) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days = [];
  const startDay = first.getDay(); // 0=Sun
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  return days;
};
const fmtDate = (y, m, d) => `${y}.${String(m + 1).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const generateTimeSlots = (duration) => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += duration) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
};

const ConsultationManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const isAdmin = user?.role === 'admin';
  const isConsultantRole = user?.role === 'consultant';

  const [tab, setTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intakeUserId, setIntakeUserId] = useState(null);
  const [intakeUserName, setIntakeUserName] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState({ name: '', items: [] });

  // Consultation notes (상담일지)
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBooking, setNoteBooking] = useState(null);
  const [noteErrors, setNoteErrors] = useState({});
  const defaultNoteForm = {
    consultType: '',           // 상담유형: 대면/유선/온라인/기타
    timeStart: '',             // 상담시간 시작
    timeEnd: '',               // 상담시간 끝
    topic: '',                 // 상담주제
    careerGoals: [],           // 희망 진로 (checkbox array)
    consultContent: '',        // 컨설팅 내용
    consultantOpinion: '',     // 상담사 의견
    risks: '',                 // 주요리스크 및 특이사항
    photos: [],                // 상담사진 (base64 array, max 2)
    nextDate: '',              // 다음 상담 예정일
    nextTime: '',              // 다음 상담 예정 시간
  };
  const [noteForm, setNoteForm] = useState({ ...defaultNoteForm });

  // Read-only note viewer
  const [viewNoteOpen, setViewNoteOpen] = useState(false);
  const [viewNoteData, setViewNoteData] = useState(null);
  const [viewNoteBooking, setViewNoteBooking] = useState(null);

  // Photo lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');

  // History accordion expand state (by userId)
  const [expandedUsers, setExpandedUsers] = useState({});

  // Async-loaded stats
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [consultantStats, setConsultantStats] = useState({});

  // Async-loaded available instructors for assign dialog
  const [availableInstructors, setAvailableInstructors] = useState([]);

  // Async-loaded notes map for inline display (bookingId -> note|null)
  const [notesMap, setNotesMap] = useState({});

  // Async-loaded availability counts for calendar cells
  const [calAvailMap, setCalAvailMap] = useState({});

  // Async-loaded consultation history for instructor tab 1
  const [userHistoryMap, setUserHistoryMap] = useState({}); // eslint-disable-line no-unused-vars

  // Async-loaded pending-row available instructors
  const [pendingAvailMap, setPendingAvailMap] = useState({});

  // Availability calendar state
  const [availOpen, setAvailOpen] = useState(false);
  const [availInstructor, setAvailInstructor] = useState(null);
  const kstNow = getKSTDate();
  const [calYear, setCalYear] = useState(kstNow.getFullYear());
  const [calMonth, setCalMonth] = useState(kstNow.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [daySlots, setDaySlots] = useState([]);
  const [sessionDur, setSessionDur] = useState(30);

  // Load bookings + auto-refresh every 5 seconds for real-time sync
  const refreshBookings = useCallback(async () => {
    setBookings(await loadBookings());
  }, []);

  useEffect(() => {
    refreshBookings();
    const interval = setInterval(refreshBookings, 5000);
    const onStorage = (e) => { if (e.key === 'woori_consultation_bookings') refreshBookings(); };
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(interval); window.removeEventListener('storage', onStorage); };
  }, [refreshBookings]);

  // Load stats whenever bookings change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, cs] = await Promise.all([getConsultationStats(), getConsultantStats()]);
      if (!cancelled) {
        setStats(s);
        setConsultantStats(cs);
      }
    })();
    return () => { cancelled = true; };
  }, [bookings]);

  // Apply search + dropdown filters
  const filterBooking = useCallback((b) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterMethod !== 'all' && b.method !== filterMethod) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (b.userName || '').toLowerCase().includes(q)
      || (b.userEmail || '').toLowerCase().includes(q)
      || (b.consultantName || '').toLowerCase().includes(q)
      || (b.date || '').includes(q)
      || (b.method || '').toLowerCase().includes(q);
  }, [filterStatus, filterMethod, searchTerm]);

  const sortByDateDesc = (a, b) => {
    const dateA = `${a.date} ${a.time}`;
    const dateB = `${b.date} ${b.time}`;
    return dateB.localeCompare(dateA);
  };
  const allMyBookings = (isConsultantRole
    ? bookings.filter((b) => b.consultantId === user.id && b.status !== 'cancelled')
    : bookings.filter((b) => b.status !== 'cancelled')
  ).sort(sortByDateDesc);
  const pendingBookings = bookings.filter((b) => b.status === 'pending').filter(filterBooking);
  const myBookings = allMyBookings.filter(filterBooking);
  const PAGE_SIZE = 8;

  // Load available instructors when assignTarget changes
  useEffect(() => {
    let cancelled = false;
    if (!assignTarget) {
      setAvailableInstructors([]);
      return;
    }
    (async () => {
      const result = await getAvailableInstructorsForSlot(assignTarget.date, assignTarget.time);
      if (!cancelled) setAvailableInstructors(result);
    })();
    return () => { cancelled = true; };
  }, [assignTarget]);

  // Load available instructors for each pending booking (admin tab 0)
  useEffect(() => {
    let cancelled = false;
    if (!isAdmin) return;
    (async () => {
      const map = {};
      await Promise.all(pendingBookings.map(async (b) => {
        map[b.id] = await getAvailableInstructorsForSlot(b.date, b.time);
      }));
      if (!cancelled) setPendingAvailMap(map);
    })();
    return () => { cancelled = true; };
  }, [isAdmin, pendingBookings.length, bookings]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load notes for inline display (booking list with note indicators)
  useEffect(() => {
    let cancelled = false;
    const relevantBookings = myBookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
    if (relevantBookings.length === 0) return;
    (async () => {
      const map = {};
      await Promise.all(relevantBookings.map(async (b) => {
        map[b.id] = await getNote(b.id);
      }));
      if (!cancelled) setNotesMap(map);
    })();
    return () => { cancelled = true; };
  }, [bookings, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load consultation history for instructor tab 1
  useEffect(() => {
    let cancelled = false;
    if (!isConsultantRole || tab !== 1) return;
    const userIds = [...new Set(myBookings.map((b) => b.userId))];
    if (userIds.length === 0) return;
    (async () => {
      const map = {};
      await Promise.all(userIds.map(async (uid) => {
        map[uid] = await getConsultationHistory(uid, user.id);
      }));
      if (!cancelled) setUserHistoryMap(map);
    })();
    return () => { cancelled = true; };
  }, [isConsultantRole, tab, bookings]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load availability data for calendar cells when calendar is open
  useEffect(() => {
    let cancelled = false;
    if (!availOpen || !availInstructor) return;
    const days = getMonthDays(calYear, calMonth);
    (async () => {
      const map = {};
      await Promise.all(days.filter(Boolean).map(async (day) => {
        const ds = fmtDate(calYear, calMonth, day);
        map[ds] = await getInstructorAvailability(availInstructor.id, ds);
      }));
      if (!cancelled) setCalAvailMap(map);
    })();
    return () => { cancelled = true; };
  }, [availOpen, availInstructor, calYear, calMonth, daySlots]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAssign = async (inst) => {
    if (!assignTarget) return;
    await assignConsultant(assignTarget.id, inst.id, inst.name_ko);
    setBookings(await loadBookings());
    setAssignOpen(false);
    showSuccess(`${assignTarget.userName}님에게 ${inst.name_ko} 강사 배정 → 강사 승인 대기`);
  };

  const handleApprove = async (booking) => {
    await approveBooking(booking.id);
    setBookings(await loadBookings());
    showSuccess(`${booking.userName}님 상담이 확정되었습니다.`);
  };

  const handleComplete = async (booking) => {
    await completeBooking(booking.id);
    setBookings(await loadBookings());
    showSuccess('상담이 완료 처리되었습니다.');
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    const reason = rejectComment.trim() || '해당 시간에 가용한 강사가 없습니다. 다른 시간을 선택해 주세요.';
    await rejectBooking(rejectTarget.id, reason);
    setBookings(await loadBookings());
    setRejectOpen(false);
    setRejectTarget(null);
    setRejectComment('');
    showSuccess(`${rejectTarget.userName}님의 예약이 거절되었습니다.`);
  };

  const openIntake = (uid, name) => { setIntakeUserId(uid); setIntakeUserName(name); setIntakeOpen(true); };
  const openNote = async (booking) => {
    const existing = await getNote(booking.id);
    setNoteBooking(booking);
    setNoteErrors({});
    if (existing?.content) {
      try {
        const parsed = JSON.parse(existing.content);
        setNoteForm({ ...defaultNoteForm, ...parsed, topic: existing.title || parsed.topic || '' });
      } catch {
        // Legacy plain-text note: put old content into consultContent
        setNoteForm({ ...defaultNoteForm, topic: existing.title || '', consultContent: existing.content || '' });
      }
    } else {
      setNoteForm({ ...defaultNoteForm });
    }
    setNoteOpen(true);
  };
  const validateNoteForm = () => {
    const errs = {};
    if (!noteForm.consultType) errs.consultType = true;
    if (!noteForm.timeStart || !noteForm.timeEnd) errs.time = true;
    if (!noteForm.topic.trim()) errs.topic = true;
    if (noteForm.careerGoals.length === 0) errs.careerGoals = true;
    if (!noteForm.consultContent.trim()) errs.consultContent = true;
    if (!noteForm.consultantOpinion.trim()) errs.consultantOpinion = true;
    if (!noteForm.risks.trim()) errs.risks = true;
    if (!noteForm.nextDate) {
      errs.nextDate = true;
    } else {
      const d = new Date(noteForm.nextDate);
      if (isNaN(d.getTime()) || d.getFullYear() < 2020 || d.getFullYear() > 2099) errs.nextDate = true;
    }
    setNoteErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSaveNote = async () => {
    if (!noteBooking) return;
    if (!validateNoteForm()) return;
    const title = noteForm.topic;
    const content = JSON.stringify(noteForm);
    await saveNote(noteBooking.id, title, content);

    // Auto-create next consultation booking if date+time provided
    if (noteForm.nextDate && noteForm.nextTime) {
      try {
        const { supabase } = await import('../../utils/supabase');
        const nextDateFormatted = noteForm.nextDate; // YYYY-MM-DD
        const nextTime = noteForm.nextTime; // HH:MM
        // Convert date to display format YYYY.MM.DD
        const displayDate = nextDateFormatted.replace(/-/g, '.');
        const bookingData = {
          user_id: noteBooking.userId,
          user_name: noteBooking.userName,
          user_email: noteBooking.userEmail || '',
          date: displayDate,
          time: nextTime,
          method: noteBooking.method || '온라인',
          consultant_id: user.id,
          consultant_name: user.name_ko,
        };
        // Try 'proposed' status first; fall back to 'pending_approval' if CHECK constraint not updated
        let { error } = await supabase.from('consultation_bookings').insert({ ...bookingData, status: 'proposed' });
        if (error) {
          console.warn('proposed status failed, falling back to pending_approval:', error.message);
          const r = await supabase.from('consultation_bookings').insert({ ...bookingData, status: 'pending_approval' });
          error = r.error;
        }
        if (error) {
          console.error('Booking insert failed:', error.message);
          showError(`다음 상담 예약 실패: ${error.message}`);
        } else {
          setBookings(await loadBookings());
          // Notify the user about the proposal
          pushUserNotification(
            noteBooking.userEmail,
            `${user.name_ko} 강사가 다음 상담을 제안했습니다 (${displayDate} ${nextTime})`,
            '/activities?tab=1'
          );
          showSuccess(`상담일지 저장 + 다음 상담 (${displayDate} ${nextTime}) 제안됨 (사용자 승인 대기)`);
        }
      } catch (e) {
        console.error('Auto-booking failed:', e);
        showSuccess('상담일지가 저장되었습니다. (다음 상담 자동 예약 실패)');
      }
    } else {
      showSuccess('상담일지가 저장되었습니다.');
    }
    setNoteOpen(false);
  };

  const openViewNote = async (booking) => {
    const existing = await getNote(booking.id);
    if (!existing?.content) {
      showError('저장된 상담 기록이 없습니다.');
      return;
    }
    try {
      setViewNoteData(JSON.parse(existing.content));
    } catch {
      setViewNoteData({ consultContent: existing.content, topic: existing.title });
    }
    setViewNoteBooking(booking);
    setViewNoteOpen(true);
  };
  const updateNoteField = (field, value) => {
    setNoteForm((prev) => ({ ...prev, [field]: value }));
    const errKey = (field === 'timeStart' || field === 'timeEnd') ? 'time' : field;
    setNoteErrors((prev) => ({ ...prev, [errKey]: false }));
  };
  const toggleCareerGoal = (goal) => {
    setNoteForm((prev) => ({
      ...prev,
      careerGoals: prev.careerGoals.includes(goal)
        ? prev.careerGoals.filter((g) => g !== goal)
        : [...prev.careerGoals, goal],
    }));
    setNoteErrors((prev) => ({ ...prev, careerGoals: false }));
  };
  const openHistory = async (uid, name) => {
    const items = await getConsultationHistory(uid, isConsultantRole ? user.id : null);
    setHistoryData({ name, items });
    setHistoryOpen(true);
  };

  // ─── Availability calendar logic ───
  const openAvailCalendar = async (inst) => {
    setAvailInstructor(inst);
    const now = getKSTDate();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
    setSelectedDay(null);
    const dur = await getInstructorSessionDuration(inst.id);
    setSessionDur(dur);
    setAvailOpen(true);
  };

  // For instructor, open their own calendar
  const openMyAvail = () => {
    const me = CONSULTANTS.find((c) => c.id === user.id);
    if (me) openAvailCalendar(me);
  };

  const calDays = useMemo(() => getMonthDays(calYear, calMonth), [calYear, calMonth]);
  const timeSlots = useMemo(() => generateTimeSlots(sessionDur), [sessionDur]);

  // Default weekday slots: 09:00 ~ 17:30 (based on session duration)
  const getDefaultWeekdaySlots = useCallback((dur) => {
    const slots = [];
    for (let h = 9; h < 18; h++) {
      for (let m = 0; m < 60; m += dur) {
        if (h === 17 && m + dur > 60) break; // don't exceed 18:00
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const selectDay = useCallback(async (day) => {
    if (!day || !availInstructor) return;
    setSelectedDay(day);
    const ds = fmtDate(calYear, calMonth, day);
    const saved = await getInstructorAvailability(availInstructor.id, ds);
    if (saved && saved.length > 0) {
      setDaySlots(saved);
    } else {
      // No saved data — apply default for weekdays (Mon-Fri)
      const dow = new Date(calYear, calMonth, day).getDay();
      const isWeekday = dow >= 1 && dow <= 5;
      setDaySlots(isWeekday ? getDefaultWeekdaySlots(sessionDur) : []);
    }
  }, [availInstructor, calYear, calMonth, sessionDur, getDefaultWeekdaySlots]);

  const toggleSlot = (time) => {
    setDaySlots((prev) => prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time].sort());
  };

  const saveDaySlots = async () => {
    if (!availInstructor || !selectedDay) return;
    const ds = fmtDate(calYear, calMonth, selectedDay);
    await setInstructorAvailability(availInstructor.id, ds, daySlots);
    showSuccess(`${ds} 가용시간 저장 (${daySlots.length}슬롯)`);
  };

  const handleDurationChange = async (_, val) => {
    if (!val || !availInstructor) return;
    setSessionDur(val);
    await setInstructorSessionDuration(availInstructor.id, val);
    setSelectedDay(null);
    setDaySlots([]);
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const copyToWeek = async () => {
    if (!availInstructor || !selectedDay) return;
    const src = fmtDate(calYear, calMonth, selectedDay);
    const srcDow = new Date(calYear, calMonth, selectedDay).getDay();
    const targets = [];
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    for (let d = selectedDay + 7; d <= daysInMonth; d += 7) {
      targets.push(fmtDate(calYear, calMonth, d));
    }
    await copyAvailabilityToRange(availInstructor.id, src, targets);
    showSuccess(`매주 ${DAY_NAMES[srcDow]}요일에 복사 (${targets.length}일)`);
  };

  const copyToMonth = async () => {
    if (!availInstructor || !selectedDay) return;
    const src = fmtDate(calYear, calMonth, selectedDay);
    const srcDow = new Date(calYear, calMonth, selectedDay).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const targets = [];
    for (let d = 1; d <= daysInMonth; d++) {
      if (d === selectedDay) continue;
      const dow = new Date(calYear, calMonth, d).getDay();
      if (dow === srcDow) targets.push(fmtDate(calYear, calMonth, d));
    }
    await copyAvailabilityToRange(availInstructor.id, src, targets);
    showSuccess(`이번 달 모든 ${DAY_NAMES[srcDow]}요일에 복사 (${targets.length}일)`);
  };

  const myUsers = isConsultantRole
    ? [...new Map(myBookings.map((b) => [b.userId, { id: b.userId, name: b.userName, email: b.userEmail }])).values()]
    : [];

  // Tab config based on role
  const tabs = isAdmin
    ? [{ label: `예약 배정 (${pendingBookings.length})` }, { label: '전체 상담' }, { label: '강사 가용시간 관리' }]
    : [{ label: '나의 상담' }, { label: '상담 이력' }, { label: '가용시간 관리' }];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>상담 관리</Typography>
        <Typography variant="body2" color="text.secondary">
          {isConsultantRole ? '배정된 상담 및 가용시간을 관리합니다' : '상담 예약 배정 및 강사 가용시간을 관리합니다'}
        </Typography>
      </Box>

      {/* KPI */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: '전체', value: isConsultantRole ? myBookings.length : stats.total, color: '#0047BA', bg: '#EBF0FA' },
          { label: isAdmin ? '배정 대기' : '승인 대기', value: isAdmin ? stats.pending : myBookings.filter((b) => b.status === 'pending_approval').length, color: '#7C3AED', bg: '#F3F0FF' },
          { label: '확정', value: isConsultantRole ? myBookings.filter((b) => b.status === 'confirmed').length : stats.confirmed, color: '#1E40AF', bg: '#DBEAFE' },
          { label: '완료', value: isConsultantRole ? myBookings.filter((b) => b.status === 'completed').length : stats.completed, color: '#166534', bg: '#DCFCE7' },
        ].map((k) => (
          <Grid item xs={6} md={3} key={k.label}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: k.color, fontWeight: 600 }}>{k.label}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: k.color }}>{k.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setSearchTerm(''); setFilterStatus('all'); setFilterMethod('all'); }} sx={{ mb: 2 }}>
          {tabs.map((t, i) => <Tab key={i} label={t.label} />)}
        </Tabs>

        {/* Filters + Search — shown on booking tabs */}
        {((isAdmin && tab <= 1) || (isConsultantRole && tab <= 1)) && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, mb: 2, alignItems: { md: 'center' } }}>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 120 } }}>
              <InputLabel>상태</InputLabel>
              <Select value={filterStatus} label="상태" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="pending">배정 대기</MenuItem>
                <MenuItem value="pending_approval">승인 대기</MenuItem>
                <MenuItem value="confirmed">확정</MenuItem>
                <MenuItem value="completed">완료</MenuItem>
                <MenuItem value="cancelled">취소</MenuItem>
                <MenuItem value="rejected">거절</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 120 } }}>
              <InputLabel>방법</InputLabel>
              <Select value={filterMethod} label="방법" onChange={(e) => setFilterMethod(e.target.value)}>
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="온라인">온라인</MenuItem>
                <MenuItem value="오프라인">오프라인</MenuItem>
                <MenuItem value="전화">전화</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth size="small" placeholder="검색 (이름, 이메일, 날짜...)"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
            />
          </Box>
        )}

        {/* ─── Tab 0 (Admin): Pending assignments ─── */}
        {isAdmin && tab === 0 && (
          pendingBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">배정 대기 중인 예약이 없습니다</Typography></Box>
          ) : isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {pendingBookings.map((b) => {
                const avail = pendingAvailMap[b.id] || [];
                return (
                  <Paper key={b.id} elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{b.userName}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight={600}>{b.date}</Typography>
                      <Typography variant="body2" fontWeight={600} color="primary">{b.time}</Typography>
                      <Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 24 }} />
                    </Box>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>가용 강사</Typography>
                      {avail.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {avail.map((inst) => (
                            <Chip key={inst.id} label={inst.name_ko} size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600, fontSize: '0.75rem' }} />
                          ))}
                        </Box>
                      ) : <Typography variant="caption" color="error">없음</Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" variant="contained" startIcon={<AssignIcon />} onClick={() => { setAssignTarget(b); setAssignOpen(true); }} sx={{ fontSize: '0.75rem', flex: 1 }}>배정</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => { setRejectTarget(b); setRejectComment(''); setRejectOpen(true); }} sx={{ fontSize: '0.75rem', flex: 1 }}>거절</Button>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 480 }}><Table size="small" stickyHeader><TableHead><TableRow>
              <TableCell>신청자</TableCell><TableCell align="center">희망 날짜</TableCell>
              <TableCell align="center">희망 시간</TableCell><TableCell align="center">방법</TableCell>
              <TableCell align="center">가용 강사</TableCell><TableCell align="center">처리</TableCell>
            </TableRow></TableHead><TableBody>
              {pendingBookings.map((b) => {
                const avail = pendingAvailMap[b.id] || [];
                return (
                  <TableRow key={b.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={500}>{b.userName}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2" fontWeight={600}>{b.date}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2" fontWeight={600}>{b.time}</Typography></TableCell>
                    <TableCell align="center"><Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 24 }} /></TableCell>
                    <TableCell align="center">
                      {avail.length > 0 ? avail.map((inst) => (
                        <Chip key={inst.id} label={inst.name_ko} size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600, fontSize: '0.75rem', mr: 0.5 }} />
                      )) : <Typography variant="caption" color="error">없음</Typography>}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button size="small" variant="contained" startIcon={<AssignIcon />} onClick={() => { setAssignTarget(b); setAssignOpen(true); }} sx={{ fontSize: '0.75rem' }}>배정</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => { setRejectTarget(b); setRejectComment(''); setRejectOpen(true); }} sx={{ fontSize: '0.75rem' }}>거절</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody></Table></TableContainer>
          )
        )}

        {/* ─── Tab 0 (Instructor): My bookings / Tab 1 (Admin): All bookings ─── */}
        {((isAdmin && tab === 1) || (isConsultantRole && tab === 0)) && (
          <Box>
          {myBookings.length > PAGE_SIZE && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {myBookings.length}건 중 최근 {PAGE_SIZE}건 표시 (스크롤하여 더 보기)
            </Typography>
          )}
          {myBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">상담 내역이 없습니다</Typography></Box>
          ) : isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {myBookings.map((b) => {
                const s = statusConfig[b.status] || { label: b.status, color: '#666', bg: '#F3F4F6' };
                const noteForBooking = notesMap[b.id];
                return (
                  <Paper key={b.id} elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{b.userName}</Typography>
                      <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, height: 22, fontSize: '0.7rem' }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight={600}>{b.date}</Typography>
                      <Typography variant="body2" fontWeight={600} color="primary">{b.time}</Typography>
                      <Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 24 }} />
                      {isAdmin && b.consultantName && <Typography variant="caption" color="text.secondary">{b.consultantName}</Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {b.status === 'pending_approval' && isConsultantRole && (
                        <Button size="small" variant="contained" color="success" startIcon={<AcceptIcon />} onClick={() => handleApprove(b)} sx={{ fontSize: '0.7rem', minWidth: 0 }}>승인</Button>
                      )}
                      {b.status === 'pending_approval' && isConsultantRole && (
                        <Button size="small" variant="outlined" color="error" onClick={() => { setRejectTarget(b); setRejectComment(''); setRejectOpen(true); }} sx={{ fontSize: '0.7rem', minWidth: 0 }}>거절</Button>
                      )}
                      {b.status === 'confirmed' && (
                        <Button size="small" variant="contained" color="success" startIcon={<DoneIcon />} onClick={() => handleComplete(b)} sx={{ fontSize: '0.7rem', minWidth: 0 }}>완료</Button>
                      )}
                      {(b.status === 'confirmed' || b.status === 'completed') && (
                        <IconButton size="small" sx={{ color: noteForBooking ? '#7C3AED' : '#9CA3AF' }} onClick={() => openNote(b)}>
                          <NoteIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" color="primary" onClick={() => openIntake(b.userId, b.userName)}><FormIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => openHistory(b.userId, b.userName)}><HistoryIcon fontSize="small" /></IconButton>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 480 }}><Table size="small" stickyHeader><TableHead><TableRow>
              <TableCell>사용자</TableCell><TableCell align="center">날짜</TableCell>
              <TableCell align="center">시간</TableCell><TableCell align="center">방법</TableCell>
              {isAdmin && <TableCell align="center">강사</TableCell>}
              <TableCell align="center">상태</TableCell><TableCell align="center">관리</TableCell>
            </TableRow></TableHead><TableBody>
              {myBookings.map((b) => {
                const s = statusConfig[b.status] || { label: b.status, color: '#666', bg: '#F3F4F6' };
                const noteForBooking = notesMap[b.id];
                return (
                  <TableRow key={b.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={500}>{b.userName}</Typography></TableCell>
                    <TableCell align="center">{b.date}</TableCell>
                    <TableCell align="center">{b.time}</TableCell>
                    <TableCell align="center"><Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 24 }} /></TableCell>
                    {isAdmin && <TableCell align="center">{b.consultantName || '-'}</TableCell>}
                    <TableCell align="center">
                      <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, height: 24, fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        {b.status === 'pending_approval' && isConsultantRole && (
                          <Tooltip title="승인"><Button size="small" variant="contained" color="success" startIcon={<AcceptIcon />} onClick={() => handleApprove(b)} sx={{ fontSize: '0.7rem', minWidth: 0 }}>승인</Button></Tooltip>
                        )}
                        {b.status === 'pending_approval' && isConsultantRole && (
                          <Tooltip title="거절"><Button size="small" variant="outlined" color="error" onClick={() => { setRejectTarget(b); setRejectComment(''); setRejectOpen(true); }} sx={{ fontSize: '0.7rem', minWidth: 0 }}>거절</Button></Tooltip>
                        )}
                        {b.status === 'confirmed' && (
                          <Tooltip title="완료 처리"><Button size="small" variant="contained" color="success" startIcon={<DoneIcon />} onClick={() => handleComplete(b)} sx={{ fontSize: '0.7rem', minWidth: 0 }}>완료 처리</Button></Tooltip>
                        )}
                        {(b.status === 'confirmed' || b.status === 'completed') && (
                          <Tooltip title={noteForBooking ? '상담 기록 보기' : '상담 기록 작성'}>
                            <IconButton size="small" sx={{ color: noteForBooking ? '#7C3AED' : '#9CA3AF' }} onClick={() => openNote(b)}>
                              <NoteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="인테이크"><IconButton size="small" color="primary" onClick={() => openIntake(b.userId, b.userName)}><FormIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="이력"><IconButton size="small" onClick={() => openHistory(b.userId, b.userName)}><HistoryIcon fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody></Table></TableContainer>
          )}
          </Box>
        )}

        {/* ─── Tab 2 (Admin) / Tab 2 (Instructor): Availability Management ─── */}
        {((isAdmin && tab === 2) || (isConsultantRole && tab === 2)) && (
          <Box>
            {isConsultantRole ? (
              <Button variant="contained" startIcon={<ClockIcon />} onClick={openMyAvail} sx={{ mb: 2 }}>내 가용시간 설정</Button>
            ) : (
              CONSULTANTS.map((c) => {
                const cs = consultantStats[c.id] || {};
                return (
                  <Paper key={c.id} elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#0047BA', width: 40, height: 40 }}>{c.name_ko.charAt(0)}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>{c.name_ko}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                      </Box>
                      <Chip label={`배정 ${cs.total || 0}건`} size="small" sx={{ fontWeight: 600, bgcolor: '#EBF0FA', color: '#0047BA' }} />
                      <Button size="small" variant="outlined" startIcon={<ClockIcon />} onClick={() => openAvailCalendar(c)}>{isMobile ? '설정' : '가용시간 설정'}</Button>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        )}

        {/* ─── Tab 1 (Instructor): 상담 이력 ─── */}
        {isConsultantRole && tab === 1 && (
          <Box>
            {myUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">상담 이력이 없습니다</Typography></Box>
            ) : myUsers.map((u) => {
              const allUserBookings = myBookings.filter((b) => b.userId === u.id);
              const isExpanded = !!expandedUsers[u.id];
              return (
                <Paper key={u.id} elevation={0} sx={{ mb: 2, borderRadius: '10px', border: '1px solid', borderColor: isExpanded ? '#0047BA' : 'divider', transition: 'border-color 0.2s' }}>
                  <Box
                    onClick={() => setExpandedUsers((prev) => ({ ...prev, [u.id]: !prev[u.id] }))}
                    sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,71,186,0.02)' } }}
                  >
                    <Avatar sx={{ bgcolor: '#0047BA' }}>{u.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600}>{u.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </Box>
                    <Chip label={`상담 ${allUserBookings.length}회`} size="small" sx={{ fontWeight: 600, bgcolor: '#EBF0FA', color: '#0047BA' }} />
                    <Tooltip title="인테이크 양식"><IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); openIntake(u.id, u.name); }}><FormIcon fontSize="small" /></IconButton></Tooltip>
                    {isExpanded ? <ExpandLessIcon sx={{ color: '#0047BA' }} /> : <ExpandMoreIcon sx={{ color: '#aaa' }} />}
                  </Box>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {allUserBookings.length > 0 && (
                    <Box sx={{ ml: { xs: 0, sm: 6 }, px: { xs: 1.5, sm: 2.5 }, pb: 2 }}>
                      {allUserBookings.map((b) => {
                        const s = statusConfig[b.status] || { label: b.status, color: '#666', bg: '#F3F4F6' };
                        const note = notesMap[b.id];
                        return (
                          <Box key={b.id} sx={{ py: 1, borderBottom: '1px solid #F3F4F6' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight={500} sx={{ minWidth: 85 }}>{b.date}</Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 45 }}>{b.time}</Typography>
                              <Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 22 }} />
                              <Chip label={s.label} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: s.bg, color: s.color, fontWeight: 600 }} />
                              {note && <Chip label={note.title || '기록 있음'} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                              {/* 희망진로 + 다음 상담 예정일 from saved note */}
                              {(() => {
                                if (!note?.content) return null;
                                try {
                                  const parsed = JSON.parse(note.content);
                                  return (
                                    <>
                                      {parsed.careerGoals?.length > 0 && parsed.careerGoals.map((g) => (
                                        <Chip key={g} label={g} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem', borderColor: '#7C3AED', color: '#7C3AED' }} />
                                      ))}
                                      {parsed.nextDate && (
                                        <Chip
                                          label={`다음 상담 예정일 ${parsed.nextDate}${parsed.nextTime ? ' ' + parsed.nextTime : ''}`}
                                          size="small"
                                          sx={{ height: 20, fontSize: '0.6rem', bgcolor: '#B3E5A1', color: '#166534', fontWeight: 600 }}
                                        />
                                      )}
                                    </>
                                  );
                                } catch { return null; }
                              })()}
                              {(b.status === 'confirmed' || b.status === 'completed') && (
                                <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                                  {note && (
                                    <Button size="small" variant="text" startIcon={<ViewNoteIcon sx={{ fontSize: '14px !important' }} />}
                                      onClick={() => openViewNote(b)} sx={{ fontSize: '0.7rem', minWidth: 0, px: 1, color: '#0047BA' }}>
                                      기록 보기
                                    </Button>
                                  )}
                                  <Button size="small" variant="outlined" onClick={() => openNote(b)} sx={{ fontSize: '0.7rem', minWidth: 0, px: 1 }}>
                                    {note ? '기록 수정' : '상담하기'}
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* ─── Assign Dialog ─── */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle fontWeight={700}>강사 배정</DialogTitle>
        <DialogContent>
          {assignTarget && (
            <Box>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: '10px', mb: 3 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={4}><Typography variant="caption" color="text.secondary">신청자</Typography><Typography variant="body2" fontWeight={600}>{assignTarget.userName}</Typography></Grid>
                  <Grid item xs={4}><Typography variant="caption" color="text.secondary">날짜</Typography><Typography variant="body2" fontWeight={700} color="primary">{assignTarget.date}</Typography></Grid>
                  <Grid item xs={4}><Typography variant="caption" color="text.secondary">시간</Typography><Typography variant="body2" fontWeight={700} color="primary">{assignTarget.time}</Typography></Grid>
                </Grid>
              </Paper>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>가용 강사 ({availableInstructors.length}명)</Typography>
              {availableInstructors.length === 0 ? (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#FEF2F2', borderRadius: '10px' }}>
                  <Typography variant="body2" color="error" fontWeight={500}>해당 시간에 가용한 강사가 없습니다.</Typography>
                </Paper>
              ) : availableInstructors.map((inst) => (
                <Paper key={inst.id} elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Avatar sx={{ bgcolor: '#0047BA' }}>{inst.name_ko.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1 }}><Typography fontWeight={600}>{inst.name_ko}</Typography><Typography variant="caption" color="text.secondary">{inst.department}</Typography></Box>
                  <Button variant="contained" size="small" startIcon={<ApproveIcon />} onClick={() => handleAssign(inst)}>배정</Button>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => setAssignOpen(false)}>닫기</Button></DialogActions>
      </Dialog>

      {/* ─── Availability Calendar Dialog ─── */}
      <Dialog open={availOpen} onClose={() => setAvailOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle fontWeight={700}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ClockIcon color="primary" />
            {availInstructor?.name_ko} - 가용시간 설정
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Session duration */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>세션 단위:</Typography>
            <ToggleButtonGroup value={sessionDur} exclusive onChange={handleDurationChange} size="small">
              <ToggleButton value={15}>15분</ToggleButton>
              <ToggleButton value={30}>30분</ToggleButton>
              <ToggleButton value={60}>1시간</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={2}>
            {/* Calendar */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <IconButton size="small" onClick={prevMonth}><ChevronLeft /></IconButton>
                <Typography variant="subtitle1" fontWeight={700}>{calYear}년 {MONTH_NAMES[calMonth]}</Typography>
                <IconButton size="small" onClick={nextMonth}><ChevronRight /></IconButton>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center' }}>
                {DAY_NAMES.map((d) => (
                  <Typography key={d} variant="caption" fontWeight={600} color="text.secondary" sx={{ py: 0.5 }}>{d}</Typography>
                ))}
                {calDays.map((day, i) => {
                  if (!day) return <Box key={`e${i}`} />;
                  const ds = fmtDate(calYear, calMonth, day);
                  const savedSlots = calAvailMap[ds] || [];
                  const dow = new Date(calYear, calMonth, day).getDay();
                  const isWeekday = dow >= 1 && dow <= 5;
                  // Show default slots count for unsaved weekdays
                  const slots = savedSlots.length > 0 ? savedSlots : (isWeekday ? getDefaultWeekdaySlots(sessionDur) : []);
                  const isSelected = day === selectedDay;
                  const isToday = ds === formatKSTDate();
                  const isWeekend = dow === 0 || dow === 6;
                  return (
                    <Paper
                      key={day} elevation={0}
                      onClick={() => selectDay(day)}
                      sx={{
                        p: 0.5, cursor: 'pointer', borderRadius: '8px', textAlign: 'center',
                        border: '2px solid', minHeight: 44,
                        borderColor: isSelected ? '#0047BA' : isToday ? '#EA580C' : 'transparent',
                        bgcolor: isSelected ? '#EBF0FA' : slots.length > 0 ? '#F0FDF4' : isWeekend ? '#FAFAFA' : '#fff',
                        '&:hover': { borderColor: '#0047BA' },
                      }}
                    >
                      <Typography variant="body2" fontWeight={isSelected ? 700 : 500} sx={{ color: isWeekend ? '#9CA3AF' : 'text.primary' }}>{day}</Typography>
                      {slots.length > 0 && (
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#059669', fontWeight: 600 }}>{slots.length}</Typography>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            </Grid>

            {/* Time slots for selected day */}
            <Grid item xs={12} md={7}>
              {selectedDay ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {calMonth + 1}/{selectedDay} ({DAY_NAMES[new Date(calYear, calMonth, selectedDay).getDay()]}) — 시간 선택
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="매주 같은 요일에 복사"><IconButton size="small" onClick={copyToWeek}><CopyIcon fontSize="small" /></IconButton></Tooltip>
                      <Chip label="매주 복사" size="small" onClick={copyToWeek} sx={{ cursor: 'pointer', fontSize: '0.7rem' }} />
                      <Chip label="이달 전체" size="small" onClick={copyToMonth} sx={{ cursor: 'pointer', fontSize: '0.7rem' }} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 320, overflow: 'auto' }}>
                    {timeSlots.map((t) => (
                      <Chip
                        key={t} label={t} size="small"
                        onClick={() => toggleSlot(t)}
                        sx={{
                          fontWeight: 600, fontSize: '0.75rem', height: 30, minWidth: 60, cursor: 'pointer',
                          border: '2px solid',
                          borderColor: daySlots.includes(t) ? '#059669' : '#E5E7EB',
                          bgcolor: daySlots.includes(t) ? '#DCFCE7' : '#fff',
                          color: daySlots.includes(t) ? '#166534' : '#6B7280',
                          '&:hover': { borderColor: '#059669' },
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">선택됨: {daySlots.length}슬롯</Typography>
                    <Button variant="contained" size="small" onClick={saveDaySlots}>저장</Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                  <Typography color="text.secondary">캘린더에서 날짜를 선택하세요</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => setAvailOpen(false)}>닫기</Button></DialogActions>
      </Dialog>

      {/* ─── Intake Dialog ─── */}
      <Dialog open={intakeOpen} onClose={() => setIntakeOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px', maxHeight: isMobile ? '100vh' : '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>{intakeUserName} - 인테이크 상담양식</Typography>
          <Button onClick={() => setIntakeOpen(false)}>닫기</Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>{intakeUserId && <IntakeForm userId={intakeUserId} embedded />}</DialogContent>
      </Dialog>

      {/* ─── History Dialog ─── */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px', minWidth: isMobile ? 'auto' : 400 } }}>
        <DialogTitle fontWeight={700}>{historyData.name} - 상담 이력</DialogTitle>
        <DialogContent>
          {historyData.items.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>상담 이력이 없습니다.</Typography>
          ) : (
            <Box>
              <Chip label={`총 ${historyData.items.length}회`} size="small" sx={{ mb: 2, fontWeight: 600, bgcolor: '#EBF0FA', color: '#0047BA' }} />
              {historyData.items.map((h, i) => (
                <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: i < historyData.items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <Typography variant="body2" fontWeight={500} sx={{ minWidth: 90 }}>{h.date}</Typography>
                  <Typography variant="body2" color="text.secondary">{h.time}</Typography>
                  <Chip icon={methodIcon[h.method]} label={h.method} size="small" sx={{ height: 22 }} />
                  {h.consultantName && <Typography variant="caption" color="text.secondary">{h.consultantName}</Typography>}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setHistoryOpen(false)}>닫기</Button></DialogActions>
      </Dialog>

      {/* ─── Reject Booking Dialog ─── */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle fontWeight={700} sx={{ color: '#C62828' }}>예약 거절</DialogTitle>
        <DialogContent>
          {rejectTarget && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>{rejectTarget.userName}</strong>님의 예약을 거절합니다.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {rejectTarget.date} {rejectTarget.time} · {rejectTarget.method}
              </Typography>
            </Box>
          )}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>거절 사유 및 추천 시간 (사용자에게 전달됨)</Typography>
          <TextField
            fullWidth multiline rows={4} value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder={"해당 시간에 가용한 강사가 없습니다. 다른 시간을 선택해 주세요.\n\n추천 시간: 예) 2026.04.10 14:00~15:00"}
            sx={{ '& .MuiInputBase-root': { fontSize: '0.85rem' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setRejectOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={handleReject}>거절 확정</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Consultation Notes Dialog (상담일지) ─── */}
      <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} maxWidth="lg" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle sx={{ bgcolor: '#1F3864', color: '#fff', py: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
            우리은행 퇴직자 전직지원 프로그램 / 상담일지 양식
          </Typography>
          {noteBooking && (
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              {noteBooking.userName} · {noteBooking.date} {noteBooking.time} · {noteBooking.method}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {/* ── Header section (grey bg) ── */}
          <Box sx={{ bgcolor: '#F2F2F2', p: 3 }}>
            {/* 상담유형 */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, mb: 2, gap: { xs: 1, sm: 2 } }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 100, bgcolor: '#B3E5A1', px: 1, py: 0.5, borderRadius: 1, textAlign: 'center', alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
                상담유형 *
              </Typography>
              <RadioGroup row value={noteForm.consultType} onChange={(e) => updateNoteField('consultType', e.target.value)}>
                {['대면', '유선', '온라인', '기타'].map((t) => (
                  <FormControlLabel key={t} value={t} control={<Radio size="small" />} label={t} />
                ))}
              </RadioGroup>
              {noteErrors.consultType && <Typography variant="caption" color="error">필수 항목</Typography>}
            </Box>

            {/* 상담시간 */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, mb: 2, gap: { xs: 1, sm: 2 } }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 100, bgcolor: '#B3E5A1', px: 1, py: 0.5, borderRadius: 1, textAlign: 'center', alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
                상담시간 *
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <TextField
                  type="time" size="small" value={noteForm.timeStart}
                  onChange={(e) => updateNoteField('timeStart', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: { xs: '100%', sm: 150 }, bgcolor: '#fff' }}
                  error={!!noteErrors.time}
                />
                <Typography variant="body2" fontWeight={600}>~</Typography>
                <TextField
                  type="time" size="small" value={noteForm.timeEnd}
                  onChange={(e) => updateNoteField('timeEnd', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: { xs: '100%', sm: 150 }, bgcolor: '#fff' }}
                  error={!!noteErrors.time}
                />
                {noteErrors.time && <Typography variant="caption" color="error">필수 항목</Typography>}
              </Box>
            </Box>

            {/* 상담주제 */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: { xs: 1, sm: 2 } }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 100, bgcolor: '#B3E5A1', px: 1, py: 0.5, borderRadius: 1, textAlign: 'center', alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
                상담주제 *
              </Typography>
              <TextField
                fullWidth size="small" value={noteForm.topic}
                onChange={(e) => updateNoteField('topic', e.target.value)}
                placeholder="예: 초기 진로 상담, 이력서 피드백 등"
                sx={{ bgcolor: '#fff' }}
                error={!!noteErrors.topic}
              />
            </Box>
          </Box>

          {/* ── 희망 진로 section ── */}
          <Box sx={{ px: 3, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ bgcolor: '#B3E5A1', px: 1.5, py: 0.5, borderRadius: 1 }}>
                희망 진로 *
              </Typography>
              {noteErrors.careerGoals && <Typography variant="caption" color="error">1개 이상 선택 필수</Typography>}
            </Box>
            <FormGroup sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 0.5 }}>
              {['재취업(정규·계약직)', '파트타임 근무', '창업·소자본 창업', '프리랜서·컨설팅', '사회공헌·강의·코칭', '아직 미정'].map((goal) => (
                <FormControlLabel
                  key={goal}
                  control={
                    <Checkbox
                      size="small"
                      checked={noteForm.careerGoals.includes(goal)}
                      onChange={() => toggleCareerGoal(goal)}
                    />
                  }
                  label={<Typography variant="body2">{goal}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>

          {/* ── 상담내용 section ── */}
          <Box sx={{ px: 3, pb: 2 }}>
            <Box sx={{ bgcolor: '#215E99', color: '#fff', px: 2, py: 1, borderRadius: '4px 4px 0 0', mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>상담내용</Typography>
            </Box>
            <Box sx={{ border: '1px solid #D1D5DB', borderTop: 'none', borderRadius: '0 0 4px 4px', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 컨설팅 내용 */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ bgcolor: '#B3E5A1', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', mb: 1 }}>
                  컨설팅 내용 *
                </Typography>
                <textarea
                  value={noteForm.consultContent}
                  onChange={(e) => updateNoteField('consultContent', e.target.value)}
                  placeholder="상담에서 다룬 구체적인 내용을 기록하세요..."
                  rows={5}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 4,
                    border: noteErrors.consultContent ? '2px solid #d32f2f' : '1px solid #D1D5DB',
                    fontSize: '0.85rem', outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                />
              </Box>

              {/* 상담사 의견 */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ bgcolor: '#B3E5A1', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', mb: 1 }}>
                  상담사 의견 *
                </Typography>
                <textarea
                  value={noteForm.consultantOpinion}
                  onChange={(e) => updateNoteField('consultantOpinion', e.target.value)}
                  placeholder="상담사로서의 소견, 조언, 평가를 기록하세요..."
                  rows={5}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 4,
                    border: noteErrors.consultantOpinion ? '2px solid #d32f2f' : '1px solid #D1D5DB',
                    fontSize: '0.85rem', outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                />
              </Box>

              {/* 주요리스크 및 특이사항 */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ bgcolor: '#B3E5A1', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', mb: 1 }}>
                  주요리스크 및 특이사항 *
                </Typography>
                <textarea
                  value={noteForm.risks}
                  onChange={(e) => updateNoteField('risks', e.target.value)}
                  placeholder="리스크 요인, 특이사항, 유의점 등을 기록하세요..."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 4,
                    border: noteErrors.risks ? '2px solid #d32f2f' : '1px solid #D1D5DB',
                    fontSize: '0.85rem', outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* ── 하단 section ── */}
          <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 상담사진 */}
            <Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: { xs: 1, sm: 2 }, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 130 }}>상담사진 (최대 2장)</Typography>
                {(noteForm.photos?.length || 0) < 2 && (
                  <Button
                    variant="outlined" size="small"
                    component="label"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    사진 추가
                    <input type="file" accept="image/*" hidden onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { showError('파일 크기가 5MB를 초과합니다'); return; }
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setNoteForm((prev) => ({
                          ...prev,
                          photos: [...(prev.photos || []), ev.target.result].slice(0, 2),
                        }));
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }} />
                  </Button>
                )}
              </Box>
              {noteForm.photos?.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {noteForm.photos.map((photo, idx) => (
                    <Box key={idx} sx={{ position: 'relative', width: 120, height: 90 }}>
                      <Box component="img" src={photo} alt={`상담사진 ${idx + 1}`}
                        onClick={() => { setLightboxSrc(photo); setLightboxOpen(true); }}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB', cursor: 'pointer', '&:hover': { opacity: 0.8 } }} />
                      <IconButton size="small"
                        onClick={() => setNoteForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#EF4444', color: '#fff', width: 20, height: 20, '&:hover': { bgcolor: '#DC2626' } }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>×</Typography>
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* 다음 상담 예정일 */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: { xs: 1, sm: 2 } }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 130, bgcolor: '#B3E5A1', px: 1, py: 0.5, borderRadius: 1, textAlign: 'center', alignSelf: { xs: 'flex-start', sm: 'auto' } }}>다음 상담 예정일 *</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <TextField
                  type="date" size="small" value={noteForm.nextDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    const d = new Date(val);
                    if (val && (isNaN(d.getTime()) || d.getFullYear() < 2020 || d.getFullYear() > 2099)) return;
                    updateNoteField('nextDate', val);
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: '2099-12-31', min: '2020-01-01' }}
                  placeholder="YYYY-MM-DD"
                  sx={{ width: { xs: '100%', sm: 200 }, bgcolor: '#fff' }}
                  error={!!noteErrors.nextDate}
                />
                <TextField
                  type="time" size="small" value={noteForm.nextTime || ''}
                  onChange={(e) => updateNoteField('nextTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: { xs: '100%', sm: 150 }, bgcolor: '#fff' }}
                />
                {noteErrors.nextDate && <Typography variant="caption" color="error">유효한 날짜를 입력하세요</Typography>}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setNoteOpen(false)} sx={{ mr: 1 }}>취소</Button>
          <Button variant="contained" onClick={handleSaveNote} sx={{ bgcolor: '#1F3864', '&:hover': { bgcolor: '#162b52' } }}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Read-only Note Viewer Dialog ─── */}
      <Dialog open={viewNoteOpen} onClose={() => setViewNoteOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle sx={{ bgcolor: '#1F3864', color: '#fff', py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>상담 기록 보기</Typography>
            {viewNoteBooking && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                {viewNoteBooking.userName} · {viewNoteBooking.date} {viewNoteBooking.time}
              </Typography>
            )}
          </Box>
          <IconButton onClick={() => setViewNoteOpen(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {viewNoteData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {viewNoteData.consultType && (
                <Box><Typography variant="caption" color="text.secondary">상담유형</Typography><Typography variant="body1" fontWeight={600}>{viewNoteData.consultType}</Typography></Box>
              )}
              {viewNoteData.timeStart && (
                <Box><Typography variant="caption" color="text.secondary">상담시간</Typography><Typography variant="body1">{viewNoteData.timeStart} ~ {viewNoteData.timeEnd}</Typography></Box>
              )}
              {viewNoteData.topic && (
                <Box><Typography variant="caption" color="text.secondary">상담주제</Typography><Typography variant="body1" fontWeight={600}>{viewNoteData.topic}</Typography></Box>
              )}
              {viewNoteData.careerGoals?.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">희망 진로</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {viewNoteData.careerGoals.map((g) => <Chip key={g} label={g} size="small" sx={{ bgcolor: '#F3F0FF', color: '#7C3AED' }} />)}
                  </Box>
                </Box>
              )}
              {viewNoteData.consultContent && (
                <Box><Typography variant="caption" color="text.secondary">컨설팅 내용</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: '#FAFAFA' }}><Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{viewNoteData.consultContent}</Typography></Paper>
                </Box>
              )}
              {viewNoteData.consultantOpinion && (
                <Box><Typography variant="caption" color="text.secondary">상담사 의견</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: '#FAFAFA' }}><Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{viewNoteData.consultantOpinion}</Typography></Paper>
                </Box>
              )}
              {viewNoteData.risks && (
                <Box><Typography variant="caption" color="text.secondary">주요리스크 및 특이사항</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: '#FEF2F2' }}><Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{viewNoteData.risks}</Typography></Paper>
                </Box>
              )}
              {viewNoteData.photos?.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">상담사진</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                    {viewNoteData.photos.map((photo, idx) => (
                      <Box key={idx} sx={{ position: 'relative' }}>
                        <Box component="img" src={photo} alt={`사진 ${idx + 1}`}
                          onClick={() => { setLightboxSrc(photo); setLightboxOpen(true); }}
                          sx={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB', cursor: 'pointer', '&:hover': { opacity: 0.8 } }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {viewNoteData.nextDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary">다음 상담 예정일</Typography>
                  <Typography variant="body1" fontWeight={600} color="primary">
                    {viewNoteData.nextDate}{viewNoteData.nextTime ? ` ${viewNoteData.nextTime}` : ''}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Photo Lightbox Dialog ─── */}
      <Dialog open={lightboxOpen} onClose={() => setLightboxOpen(false)} maxWidth="lg"
        PaperProps={{ sx: { borderRadius: '12px', bgcolor: 'transparent', boxShadow: 'none', overflow: 'visible' } }}>
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'absolute', top: -40, right: 0, display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => {
                const a = document.createElement('a');
                a.href = lightboxSrc;
                a.download = `상담사진_${Date.now()}.jpg`;
                a.click();
              }}
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
            >
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={() => setLightboxOpen(false)} sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}>
              <CloseIcon />
            </IconButton>
          </Box>
          {lightboxSrc && (
            <Box component="img" src={lightboxSrc} alt="상담사진 확대"
              sx={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 2 }} />
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default ConsultationManagement;
