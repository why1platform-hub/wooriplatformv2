import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Tabs, Tab, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
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
  HowToReg as AcceptIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  loadBookings, assignConsultant, approveBooking, completeBooking,
  getConsultationStats, getConsultantStats,
  getConsultationHistory, CONSULTANTS,
  getAvailableInstructorsForSlot,
  getInstructorAvailability, setInstructorAvailability,
  getInstructorSessionDuration, setInstructorSessionDuration,
  copyAvailabilityToRange, getNote, saveNote,
} from '../../utils/consultationStore';
import IntakeForm from '../consultations/IntakeForm';

const statusConfig = {
  pending: { label: '배정 대기', color: '#92400E', bg: '#FEF3C7' },
  pending_approval: { label: '승인 대기', color: '#7C3AED', bg: '#F3F0FF' },
  confirmed: { label: '확정', color: '#1E40AF', bg: '#DBEAFE' },
  completed: { label: '완료', color: '#166534', bg: '#DCFCE7' },
  cancelled: { label: '취소', color: '#991B1B', bg: '#FEE2E2' },
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
  const { user } = useAuth();
  const { showSuccess } = useNotification();
  const isAdmin = user?.role === 'admin';
  const isConsultantRole = user?.role === 'consultant';

  const [tab, setTab] = useState(isConsultantRole ? 0 : 0);
  const [bookings, setBookings] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intakeUserId, setIntakeUserId] = useState(null);
  const [intakeUserName, setIntakeUserName] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState({ name: '', items: [] });

  // Consultation notes
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBooking, setNoteBooking] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Availability calendar state
  const [availOpen, setAvailOpen] = useState(false);
  const [availInstructor, setAvailInstructor] = useState(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [daySlots, setDaySlots] = useState([]);
  const [sessionDur, setSessionDur] = useState(30);

  useEffect(() => { setBookings(loadBookings()); }, []);

  const stats = getConsultationStats();
  const consultantStats = getConsultantStats();

  const myBookings = isConsultantRole
    ? bookings.filter((b) => b.consultantId === user.id && b.status !== 'cancelled')
    : bookings.filter((b) => b.status !== 'cancelled');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  const availableInstructors = useMemo(() => {
    if (!assignTarget) return [];
    return getAvailableInstructorsForSlot(assignTarget.date, assignTarget.time);
  }, [assignTarget]);

  const handleAssign = (inst) => {
    if (!assignTarget) return;
    assignConsultant(assignTarget.id, inst.id, inst.name_ko);
    setBookings(loadBookings());
    setAssignOpen(false);
    showSuccess(`${assignTarget.userName}님에게 ${inst.name_ko} 강사 배정 → 강사 승인 대기`);
  };

  const handleApprove = (booking) => {
    approveBooking(booking.id);
    setBookings(loadBookings());
    showSuccess(`${booking.userName}님 상담이 확정되었습니다.`);
  };

  const handleComplete = (booking) => {
    completeBooking(booking.id);
    setBookings(loadBookings());
    showSuccess('상담이 완료 처리되었습니다.');
  };

  const openIntake = (uid, name) => { setIntakeUserId(uid); setIntakeUserName(name); setIntakeOpen(true); };
  const openNote = (booking) => {
    const existing = getNote(booking.id);
    setNoteBooking(booking);
    setNoteTitle(existing?.title || '');
    setNoteContent(existing?.content || '');
    setNoteOpen(true);
  };
  const handleSaveNote = () => {
    if (!noteBooking) return;
    saveNote(noteBooking.id, noteTitle, noteContent);
    setNoteOpen(false);
    showSuccess('상담 기록이 저장되었습니다.');
  };
  const openHistory = (uid, name) => {
    setHistoryData({ name, items: getConsultationHistory(uid, isConsultantRole ? user.id : null) });
    setHistoryOpen(true);
  };

  // ─── Availability calendar logic ───
  const openAvailCalendar = (inst) => {
    setAvailInstructor(inst);
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
    setSelectedDay(null);
    setSessionDur(getInstructorSessionDuration(inst.id));
    setAvailOpen(true);
  };

  // For instructor, open their own calendar
  const openMyAvail = () => {
    const me = CONSULTANTS.find((c) => c.id === user.id);
    if (me) openAvailCalendar(me);
  };

  const calDays = useMemo(() => getMonthDays(calYear, calMonth), [calYear, calMonth]);
  const timeSlots = useMemo(() => generateTimeSlots(sessionDur), [sessionDur]);

  const selectDay = useCallback((day) => {
    if (!day || !availInstructor) return;
    setSelectedDay(day);
    const ds = fmtDate(calYear, calMonth, day);
    setDaySlots(getInstructorAvailability(availInstructor.id, ds));
  }, [availInstructor, calYear, calMonth]);

  const toggleSlot = (time) => {
    setDaySlots((prev) => prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time].sort());
  };

  const saveDaySlots = () => {
    if (!availInstructor || !selectedDay) return;
    const ds = fmtDate(calYear, calMonth, selectedDay);
    setInstructorAvailability(availInstructor.id, ds, daySlots);
    showSuccess(`${ds} 가용시간 저장 (${daySlots.length}슬롯)`);
  };

  const handleDurationChange = (_, val) => {
    if (!val || !availInstructor) return;
    setSessionDur(val);
    setInstructorSessionDuration(availInstructor.id, val);
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

  const copyToWeek = () => {
    if (!availInstructor || !selectedDay) return;
    const src = fmtDate(calYear, calMonth, selectedDay);
    const srcDow = new Date(calYear, calMonth, selectedDay).getDay();
    const targets = [];
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    for (let d = selectedDay + 7; d <= daysInMonth; d += 7) {
      targets.push(fmtDate(calYear, calMonth, d));
    }
    copyAvailabilityToRange(availInstructor.id, src, targets);
    showSuccess(`매주 ${DAY_NAMES[srcDow]}요일에 복사 (${targets.length}일)`);
  };

  const copyToMonth = () => {
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
    copyAvailabilityToRange(availInstructor.id, src, targets);
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
          <Grid item xs={6} sm={3} key={k.label}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: k.color, fontWeight: 600 }}>{k.label}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: k.color }}>{k.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          {tabs.map((t, i) => <Tab key={i} label={t.label} />)}
        </Tabs>

        {/* ─── Tab 0 (Admin): Pending assignments ─── */}
        {isAdmin && tab === 0 && (
          <TableContainer><Table size="small"><TableHead><TableRow>
            <TableCell>신청자</TableCell><TableCell align="center">희망 날짜</TableCell>
            <TableCell align="center">희망 시간</TableCell><TableCell align="center">방법</TableCell>
            <TableCell align="center">가용 강사</TableCell><TableCell align="center">처리</TableCell>
          </TableRow></TableHead><TableBody>
            {pendingBookings.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><Typography color="text.secondary">배정 대기 중인 예약이 없습니다</Typography></TableCell></TableRow>
            ) : pendingBookings.map((b) => {
              const avail = getAvailableInstructorsForSlot(b.date, b.time);
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
                    <Button size="small" variant="contained" startIcon={<AssignIcon />} onClick={() => { setAssignTarget(b); setAssignOpen(true); }} sx={{ fontSize: '0.75rem' }}>배정</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody></Table></TableContainer>
        )}

        {/* ─── Tab 0 (Instructor): My bookings / Tab 1 (Admin): All bookings ─── */}
        {((isAdmin && tab === 1) || (isConsultantRole && tab === 0)) && (
          <TableContainer><Table size="small"><TableHead><TableRow>
            <TableCell>사용자</TableCell><TableCell align="center">날짜</TableCell>
            <TableCell align="center">시간</TableCell><TableCell align="center">방법</TableCell>
            {isAdmin && <TableCell align="center">강사</TableCell>}
            <TableCell align="center">상태</TableCell><TableCell align="center">관리</TableCell>
          </TableRow></TableHead><TableBody>
            {myBookings.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography color="text.secondary">상담 내역이 없습니다</Typography></TableCell></TableRow>
            ) : myBookings.map((b) => {
              const s = statusConfig[b.status];
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
                      {b.status === 'confirmed' && (
                        <Tooltip title="완료 처리"><IconButton size="small" color="success" onClick={() => handleComplete(b)}><DoneIcon fontSize="small" /></IconButton></Tooltip>
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
                      <Button size="small" variant="outlined" startIcon={<ClockIcon />} onClick={() => openAvailCalendar(c)}>가용시간 설정</Button>
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
              const hist = getConsultationHistory(u.id, user.id);
              const allUserBookings = myBookings.filter((b) => b.userId === u.id);
              return (
                <Paper key={u.id} elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#0047BA' }}>{u.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}><Typography fontWeight={600}>{u.name}</Typography><Typography variant="caption" color="text.secondary">{u.email}</Typography></Box>
                    <Chip label={`상담 ${hist.length}회 완료`} size="small" sx={{ fontWeight: 600, bgcolor: '#EBF0FA', color: '#0047BA' }} />
                    <Tooltip title="인테이크 양식"><IconButton size="small" color="primary" onClick={() => openIntake(u.id, u.name)}><FormIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                  {/* Session list with notes */}
                  {allUserBookings.length > 0 && (
                    <Box sx={{ ml: 6 }}>
                      {allUserBookings.map((b) => {
                        const s = statusConfig[b.status];
                        const note = getNote(b.id);
                        return (
                          <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid #F3F4F6' }}>
                            <Typography variant="body2" fontWeight={500} sx={{ minWidth: 85 }}>{b.date}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 45 }}>{b.time}</Typography>
                            <Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 22 }} />
                            <Chip label={s.label} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: s.bg, color: s.color, fontWeight: 600 }} />
                            {note && <Chip label={note.title || '기록 있음'} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                            {(b.status === 'confirmed' || b.status === 'completed') && (
                              <Button size="small" variant="outlined" onClick={() => openNote(b)} sx={{ fontSize: '0.7rem', ml: 'auto', minWidth: 0, px: 1 }}>
                                {note ? '기록 수정' : '상담하기'}
                              </Button>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* ─── Assign Dialog ─── */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
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
      <Dialog open={availOpen} onClose={() => setAvailOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
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
                  const slots = availInstructor ? getInstructorAvailability(availInstructor.id, ds) : [];
                  const isSelected = day === selectedDay;
                  const isToday = ds === new Date().toISOString().slice(0, 10).replace(/-/g, '.');
                  const dow = new Date(calYear, calMonth, day).getDay();
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
      <Dialog open={intakeOpen} onClose={() => setIntakeOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px', maxHeight: '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>{intakeUserName} - 인테이크 상담양식</Typography>
          <Button onClick={() => setIntakeOpen(false)}>닫기</Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>{intakeUserId && <IntakeForm userId={intakeUserId} embedded />}</DialogContent>
      </Dialog>

      {/* ─── History Dialog ─── */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} PaperProps={{ sx: { borderRadius: '12px', minWidth: 400 } }}>
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

      {/* ─── Consultation Notes Dialog ─── */}
      <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>
          {noteBooking && (
            <Box>
              <Typography variant="h6" fontWeight={700}>상담 기록</Typography>
              <Typography variant="caption" color="text.secondary">
                {noteBooking.userName} · {noteBooking.date} {noteBooking.time} · {noteBooking.method}
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>상담 제목</Typography>
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="예: 초기 진로 상담, 이력서 피드백 등"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>상담 내용</Typography>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="상담 내용을 자유롭게 기록하세요..."
                rows={8}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #D1D5DB', fontSize: '0.85rem', outline: 'none',
                  fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setNoteOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveNote}>저장</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultationManagement;
