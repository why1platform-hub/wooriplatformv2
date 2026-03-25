import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Tabs, Tab, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
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
  EventAvailable as AvailIcon,
  Schedule as ClockIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  loadBookings, assignConsultant, completeBooking,
  getConsultationStats, getConsultantStats,
  getConsultationHistory, CONSULTANTS, getIntakeForm,
  getAvailableInstructorsForSlot, loadAvailability, saveAvailability,
  getAvailableSlots,
} from '../../utils/consultationStore';
import IntakeForm from '../consultations/IntakeForm';

const statusConfig = {
  pending: { label: '배정 대기', color: '#92400E', bg: '#FEF3C7' },
  confirmed: { label: '확정', color: '#1E40AF', bg: '#DBEAFE' },
  completed: { label: '완료', color: '#166534', bg: '#DCFCE7' },
  cancelled: { label: '취소', color: '#991B1B', bg: '#FEE2E2' },
};
const methodIcon = { '온라인': <OnlineIcon sx={{ fontSize: 16 }} />, '오프라인': <OfflineIcon sx={{ fontSize: 16 }} />, '전화': <PhoneIcon sx={{ fontSize: 16 }} /> };

const ConsultationManagement = () => {
  const { user } = useAuth();
  const { showSuccess } = useNotification();
  const isAdmin = user?.role === 'admin';
  const isConsultantRole = user?.role === 'consultant';

  const [tab, setTab] = useState(isConsultantRole ? 1 : 0);
  const [bookings, setBookings] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intakeUserId, setIntakeUserId] = useState(null);
  const [intakeUserName, setIntakeUserName] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState({ name: '', items: [] });
  const [availOpen, setAvailOpen] = useState(false);
  const [availInstructor, setAvailInstructor] = useState(null);
  const [availDate, setAvailDate] = useState(null);
  const [availSlots, setAvailSlots] = useState([]);

  useEffect(() => { setBookings(loadBookings()); }, []);

  const stats = getConsultationStats();
  const consultantStats = getConsultantStats();

  const myBookings = isConsultantRole
    ? bookings.filter((b) => b.consultantId === user.id && b.status !== 'cancelled')
    : bookings.filter((b) => b.status !== 'cancelled');

  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  // Available instructors for the assign target
  const availableInstructors = useMemo(() => {
    if (!assignTarget) return [];
    return getAvailableInstructorsForSlot(assignTarget.date, assignTarget.time);
  }, [assignTarget]);

  const handleAssign = (instructor) => {
    if (!assignTarget) return;
    assignConsultant(assignTarget.id, instructor.id, instructor.name_ko);
    setBookings(loadBookings());
    setAssignOpen(false);
    showSuccess(`${assignTarget.userName}님에게 ${instructor.name_ko} 강사가 배정되었습니다.`);
  };

  const handleComplete = (booking) => {
    completeBooking(booking.id);
    setBookings(loadBookings());
    showSuccess('상담이 완료 처리되었습니다.');
  };

  const openIntake = (userId, userName) => { setIntakeUserId(userId); setIntakeUserName(userName); setIntakeOpen(true); };
  const openHistory = (userId, userName) => {
    const items = getConsultationHistory(userId, isConsultantRole ? user.id : null);
    setHistoryData({ name: userName, items }); setHistoryOpen(true);
  };

  // Instructor availability editing
  const dates14 = useMemo(() => {
    const result = [];
    const d = new Date(); d.setDate(d.getDate() + 1);
    while (result.length < 14) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '.');
        const dayNames = ['일','월','화','수','목','금','토'];
        result.push({ date: dateStr, label: `${d.getMonth()+1}/${d.getDate()} (${dayNames[day]})` });
      }
      d.setDate(d.getDate() + 1);
    }
    return result;
  }, []);

  const openAvailEditor = (instructor) => {
    setAvailInstructor(instructor);
    setAvailDate(dates14[0]?.date || null);
    const all = loadAvailability();
    setAvailSlots(all[instructor.id]?.[dates14[0]?.date] || []);
    setAvailOpen(true);
  };

  const handleAvailDateChange = (dateStr) => {
    setAvailDate(dateStr);
    const all = loadAvailability();
    setAvailSlots(all[availInstructor.id]?.[dateStr] || []);
  };

  const toggleSlot = (time) => {
    setAvailSlots((prev) => prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time].sort());
  };

  const saveAvail = () => {
    if (!availInstructor || !availDate) return;
    const all = loadAvailability();
    if (!all[availInstructor.id]) all[availInstructor.id] = {};
    all[availInstructor.id][availDate] = availSlots;
    saveAvailability(all);
    showSuccess(`${availInstructor.name_ko} 강사의 ${availDate} 가용시간이 저장되었습니다.`);
  };

  const myUsers = isConsultantRole
    ? [...new Map(myBookings.map((b) => [b.userId, { id: b.userId, name: b.userName, email: b.userEmail }])).values()]
    : [];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>상담 관리</Typography>
        <Typography variant="body2" color="text.secondary">
          {isConsultantRole ? '배정된 상담 및 사용자 인테이크 양식을 관리합니다' : '상담 예약 배정 및 강사 가용시간을 관리합니다'}
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: '전체', value: stats.total, color: '#0047BA', bg: '#EBF0FA' },
          { label: '배정 대기', value: stats.pending, color: '#92400E', bg: '#FEF3C7' },
          { label: '확정', value: stats.confirmed, color: '#1E40AF', bg: '#DBEAFE' },
          { label: '완료', value: stats.completed, color: '#166534', bg: '#DCFCE7' },
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
          {isAdmin && <Tab label={`예약 배정 (${pendingBookings.length})`} />}
          <Tab label={isConsultantRole ? '나의 상담' : '전체 상담'} />
          {isAdmin && <Tab label="강사 가용시간 관리" />}
          {isConsultantRole && <Tab label="나의 사용자" />}
        </Tabs>

        {/* Tab 0 (Admin): Pending assignments */}
        {isAdmin && tab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>신청자</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell align="center">희망 날짜</TableCell>
                  <TableCell align="center">희망 시간</TableCell>
                  <TableCell align="center">방법</TableCell>
                  <TableCell align="center">가용 강사</TableCell>
                  <TableCell align="center">처리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingBookings.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">배정 대기 중인 예약이 없습니다</Typography>
                  </TableCell></TableRow>
                ) : pendingBookings.map((b) => {
                  const avail = getAvailableInstructorsForSlot(b.date, b.time);
                  return (
                    <TableRow key={b.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{b.userName}</Typography></TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{b.userEmail}</Typography></TableCell>
                      <TableCell align="center"><Typography variant="body2" fontWeight={600}>{b.date}</Typography></TableCell>
                      <TableCell align="center"><Typography variant="body2" fontWeight={600}>{b.time}</Typography></TableCell>
                      <TableCell align="center">
                        <Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 24 }} />
                      </TableCell>
                      <TableCell align="center">
                        {avail.length > 0 ? (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {avail.map((inst) => (
                              <Chip key={inst.id} label={inst.name_ko} size="small"
                                sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600, fontSize: '0.75rem' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="error">가용 강사 없음</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small" variant="contained" startIcon={<AssignIcon />}
                          onClick={() => { setAssignTarget(b); setAssignOpen(true); }}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          배정
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 1: All/My bookings */}
        {((isAdmin && tab === 1) || (isConsultantRole && tab === 0)) && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>사용자</TableCell>
                  <TableCell align="center">날짜</TableCell>
                  <TableCell align="center">시간</TableCell>
                  <TableCell align="center">방법</TableCell>
                  <TableCell align="center">강사</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myBookings.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">상담 내역이 없습니다</Typography>
                  </TableCell></TableRow>
                ) : myBookings.map((b) => {
                  const s = statusConfig[b.status];
                  return (
                    <TableRow key={b.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{b.userName}</Typography></TableCell>
                      <TableCell align="center">{b.date}</TableCell>
                      <TableCell align="center">{b.time}</TableCell>
                      <TableCell align="center">
                        <Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 24 }} />
                      </TableCell>
                      <TableCell align="center">{b.consultantName || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, height: 24, fontSize: '0.75rem' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {b.status === 'confirmed' && (
                            <Tooltip title="완료 처리"><IconButton size="small" color="success" onClick={() => handleComplete(b)}><DoneIcon fontSize="small" /></IconButton></Tooltip>
                          )}
                          <Tooltip title="인테이크 양식"><IconButton size="small" color="primary" onClick={() => openIntake(b.userId, b.userName)}><FormIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="상담 이력"><IconButton size="small" onClick={() => openHistory(b.userId, b.userName)}><HistoryIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 2 (Admin): Instructor Availability Management */}
        {isAdmin && tab === 2 && (
          <Box>
            {CONSULTANTS.map((c) => {
              const cs = consultantStats[c.id] || {};
              return (
                <Paper key={c.id} elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#0047BA', width: 40, height: 40, fontSize: '0.9rem' }}>{c.name_ko.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>{c.name_ko}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.email} · {c.department}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={700} color="primary">{cs.total || 0}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>배정</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={700} color="success.main">{cs.completed || 0}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>완료</Typography>
                      </Box>
                    </Box>
                    <Button size="small" variant="outlined" startIcon={<AvailIcon />} onClick={() => openAvailEditor(c)}>
                      가용시간 설정
                    </Button>
                  </Box>
                  {/* Show upcoming availability summary */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {dates14.slice(0, 5).map((d) => {
                      const all = loadAvailability();
                      const slots = all[c.id]?.[d.date] || [];
                      return (
                        <Chip
                          key={d.date} size="small"
                          label={`${d.label}: ${slots.length > 0 ? slots.length + '슬롯' : '없음'}`}
                          sx={{
                            fontSize: '0.7rem', height: 24,
                            bgcolor: slots.length > 0 ? '#DCFCE7' : '#F3F4F6',
                            color: slots.length > 0 ? '#166534' : '#9CA3AF',
                            fontWeight: 500,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* Tab (Consultant): My users */}
        {isConsultantRole && tab === 1 && (
          <Box>
            {myUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">배정된 사용자가 없습니다</Typography></Box>
            ) : myUsers.map((u) => {
              const history = getConsultationHistory(u.id, user.id);
              const hasForm = !!getIntakeForm(u.id);
              return (
                <Paper key={u.id} elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#0047BA' }}>{u.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>{u.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </Box>
                    <Chip label={`상담 ${history.length}회`} size="small" sx={{ fontWeight: 600, bgcolor: '#EBF0FA', color: '#0047BA' }} />
                    <Tooltip title="상담 이력"><IconButton size="small" onClick={() => openHistory(u.id, u.name)}><HistoryIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title={hasForm ? '인테이크 양식 수정' : '인테이크 양식 작성'}>
                      <IconButton size="small" color="primary" onClick={() => openIntake(u.id, u.name)}><FormIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* ─── Assign Instructor Dialog ─── */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>강사 배정</DialogTitle>
        <DialogContent>
          {assignTarget && (
            <Box>
              {/* User's requested slot */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: '10px', mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>사용자 요청 정보</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">신청자</Typography>
                    <Typography variant="body2" fontWeight={600}>{assignTarget.userName}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">희망 날짜</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary">{assignTarget.date}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">희망 시간</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary">{assignTarget.time}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Available instructors */}
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                해당 시간 가용 강사 ({availableInstructors.length}명)
              </Typography>

              {availableInstructors.length === 0 ? (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#FEF2F2', borderRadius: '10px' }}>
                  <Typography variant="body2" color="error" fontWeight={500}>
                    해당 시간에 가용한 강사가 없습니다.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    "강사 가용시간 관리" 탭에서 강사 가용시간을 먼저 설정해주세요.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {availableInstructors.map((inst) => {
                    const cs = consultantStats[inst.id] || {};
                    return (
                      <Paper key={inst.id} elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#0047BA', width: 40, height: 40 }}>{inst.name_ko.charAt(0)}</Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={600}>{inst.name_ko}</Typography>
                          <Typography variant="caption" color="text.secondary">{inst.department} · 상담 {cs.total || 0}건 완료</Typography>
                        </Box>
                        <Button variant="contained" size="small" startIcon={<ApproveIcon />} onClick={() => handleAssign(inst)}>
                          배정하기
                        </Button>
                      </Paper>
                    );
                  })}
                </Box>
              )}

              {/* Also show all instructors (unavailable ones greyed out) */}
              {availableInstructors.length < CONSULTANTS.length && availableInstructors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">해당 시간 비가용 강사:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    {CONSULTANTS.filter((c) => !availableInstructors.find((a) => a.id === c.id)).map((c) => (
                      <Chip key={c.id} label={c.name_ko} size="small" sx={{ bgcolor: '#F3F4F6', color: '#9CA3AF' }} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAssignOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Availability Editor Dialog ─── */}
      <Dialog open={availOpen} onClose={() => setAvailOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ClockIcon color="primary" />
            {availInstructor?.name_ko} 강사 - 가용시간 설정
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Date selector */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>날짜 선택</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2.5 }}>
            {dates14.map((d) => (
              <Chip
                key={d.date} label={d.label} size="small"
                onClick={() => handleAvailDateChange(d.date)}
                sx={{
                  fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
                  border: '2px solid',
                  borderColor: availDate === d.date ? '#0047BA' : 'transparent',
                  bgcolor: availDate === d.date ? '#EBF0FA' : '#F8F9FA',
                }}
              />
            ))}
          </Box>

          {/* Time slot checkboxes */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>가용 시간 선택 (체크한 시간에 상담 배정 가능)</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {getAvailableSlots(availDate || '2026.04.01').map((time) => (
              <Chip
                key={time} label={time} size="small"
                onClick={() => toggleSlot(time)}
                sx={{
                  fontWeight: 600, fontSize: '0.8rem', height: 34, minWidth: 68, cursor: 'pointer',
                  border: '2px solid',
                  borderColor: availSlots.includes(time) ? '#059669' : '#E5E7EB',
                  bgcolor: availSlots.includes(time) ? '#DCFCE7' : '#fff',
                  color: availSlots.includes(time) ? '#166534' : '#6B7280',
                  '&:hover': { borderColor: '#059669' },
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            선택됨: {availSlots.length}개 슬롯
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAvailOpen(false)}>취소</Button>
          <Button variant="contained" onClick={() => { saveAvail(); setAvailOpen(false); }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Intake Form Dialog ─── */}
      <Dialog open={intakeOpen} onClose={() => setIntakeOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px', maxHeight: '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{intakeUserName} - 인테이크 상담양식</Typography>
          <Button onClick={() => setIntakeOpen(false)}>닫기</Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {intakeUserId && <IntakeForm userId={intakeUserId} onClose={() => setIntakeOpen(false)} embedded />}
        </DialogContent>
      </Dialog>

      {/* ─── History Dialog ─── */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} PaperProps={{ sx: { borderRadius: '12px', minWidth: 400 } }}>
        <DialogTitle fontWeight={700}>{historyData.name} - 상담 이력</DialogTitle>
        <DialogContent>
          {historyData.items.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>상담 이력이 없습니다.</Typography>
          ) : (
            <Box>
              <Chip label={`총 ${historyData.items.length}회 상담`} size="small" sx={{ mb: 2, fontWeight: 600, bgcolor: '#EBF0FA', color: '#0047BA' }} />
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
    </Box>
  );
};

export default ConsultationManagement;
