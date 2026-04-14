import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Stepper, Step, StepLabel,
  Chip, Paper, Divider, Alert, IconButton, CircularProgress,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Videocam as OnlineIcon,
  LocationOn as OfflineIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  addBooking, getBookedSlots, getKSTDate, formatKSTDate,
  hasAvailableInstructor, loadConsultants,
} from '../../utils/consultationStore';
import { pushToAllAdmins } from '../../utils/notificationHelper';

const STEPS = ['날짜 · 시간 선택', '상담 방법 선택', '예약 확인'];

const METHODS = [
  { value: '온라인', icon: <OnlineIcon />, color: '#0047BA', desc: '화상 회의로 진행' },
  { value: '오프라인', icon: <OfflineIcon />, color: '#059669', desc: '우리은행 본점 상담실' },
  { value: '전화', icon: <PhoneIcon />, color: '#EA580C', desc: '유선 통화로 진행' },
];

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// Generate 30-min time slots from startHour to endHour
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
};

const ALL_TIMES = generateTimeSlots();

const ConsultationBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess } = useNotification();

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [booked, setBooked] = useState(false);

  // Calendar state
  const kstNow = useMemo(() => getKSTDate(), []);
  const [calendarMonth, setCalendarMonth] = useState(kstNow.getMonth());
  const [calendarYear, setCalendarYear] = useState(kstNow.getFullYear());

  // Time slot states
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({}); // time -> boolean
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Load consultants on mount
  useEffect(() => { loadConsultants(); }, []);

  // Today string for comparison
  const todayStr = useMemo(() => formatKSTDate(kstNow), [kstNow]);

  // Build calendar grid for the current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun
    const days = [];

    // Padding for days before month start
    for (let i = 0; i < startPad; i++) days.push(null);
    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(calendarYear, calendarMonth, d);
      const dayOfWeek = date.getDay();
      const dateStr = `${calendarYear}.${String(calendarMonth + 1).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
      const isPast = dateStr <= todayStr;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      days.push({ day: d, date, dateStr, dayOfWeek, isPast, isWeekend, disabled: isPast || isWeekend });
    }
    return days;
  }, [calendarYear, calendarMonth, todayStr]);

  const monthLabel = `${calendarYear}년 ${calendarMonth + 1}월`;

  const canGoPrev = useMemo(() => {
    return calendarYear > kstNow.getFullYear() || calendarMonth > kstNow.getMonth();
  }, [calendarYear, calendarMonth, kstNow]);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (calendarMonth === 0) { setCalendarYear((y) => y - 1); setCalendarMonth(11); }
    else setCalendarMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) { setCalendarYear((y) => y + 1); setCalendarMonth(0); }
    else setCalendarMonth((m) => m + 1);
  };

  // When a date is selected, load booked slots AND check instructor availability
  const checkAvailability = useCallback(async (dateStr) => {
    setCheckingAvailability(true);
    setAvailabilityMap({});
    try {
      const booked = await getBookedSlots(dateStr);
      setBookedSlots(booked);

      // Check each time slot for instructor availability
      const map = {};
      await Promise.all(
        ALL_TIMES.map(async (t) => {
          if (booked.includes(t)) {
            map[t] = false;
          } else {
            map[t] = await hasAvailableInstructor(dateStr, t);
          }
        })
      );
      setAvailabilityMap(map);
    } catch {
      // On error, show all as unavailable
      const map = {};
      ALL_TIMES.forEach((t) => { map[t] = false; });
      setAvailabilityMap(map);
    }
    setCheckingAvailability(false);
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      setAvailabilityMap({});
      return;
    }
    checkAvailability(selectedDate);
  }, [selectedDate, checkAvailability]);

  // Check if any instructor is available for the selected time
  const noInstructorAvailable = selectedTime && availabilityMap[selectedTime] === false;
  const hasAnyAvailableSlot = Object.values(availabilityMap).some(Boolean);

  const canNext = () => {
    if (step === 0) return selectedDate && selectedTime && !noInstructorAvailable;
    if (step === 1) return selectedMethod;
    return true;
  };

  const [bookingResult, setBookingResult] = useState(null);

  const handleBook = async () => {
    const result = await addBooking({
      userId: user.id,
      userName: user.name_ko,
      userEmail: user.email,
      date: selectedDate,
      time: selectedTime,
      method: selectedMethod,
    });
    setBookingResult(result);
    setBooked(true);
    if (result?.autoAssigned) {
      showSuccess(`${result.consultantName} 강사에게 자동 배정되었습니다!`);
      pushToAllAdmins(`${user.name_ko}님이 상담 예약 → ${result.consultantName} 강사 자동 배정 (${selectedDate} ${selectedTime})`, '/admin/consultations');
    } else {
      showSuccess('상담 예약이 접수되었습니다!');
      pushToAllAdmins(`${user.name_ko}님이 상담 예약을 신청했습니다 (${selectedDate} ${selectedTime})`, '/admin/consultations');
    }
  };

  if (booked) {
    const wasAutoAssigned = bookingResult?.autoAssigned;
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center', py: 6 }}>
        <CheckIcon sx={{ fontSize: 56, color: '#059669', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>예약 접수 완료</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {wasAutoAssigned
            ? `${bookingResult.consultantName} 강사에게 자동 배정되었습니다. 강사 승인 후 확정됩니다.`
            : '관리자가 상담사를 배정한 후 확정 안내를 드리겠습니다.'}
        </Typography>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', bgcolor: '#F8F9FA', textAlign: 'left', mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">날짜</Typography>
              <Typography variant="body2" fontWeight={600}>{selectedDate}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">시간</Typography>
              <Typography variant="body2" fontWeight={600}>{selectedTime}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">상담 방법</Typography>
              <Typography variant="body2" fontWeight={600}>{selectedMethod}</Typography>
            </Grid>
            {wasAutoAssigned && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">배정 강사</Typography>
                <Typography variant="body2" fontWeight={600}>{bookingResult.consultantName}</Typography>
              </Grid>
            )}
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">상태</Typography>
              {wasAutoAssigned ? (
                <Chip label="강사 승인 대기" size="small" sx={{ bgcolor: '#F3F0FF', color: '#7C3AED', fontWeight: 600 }} />
              ) : (
                <Chip label="배정 대기" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
              )}
            </Grid>
          </Grid>
        </Paper>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/activities/consultations')}>내 상담 내역</Button>
          <Button variant="contained" onClick={() => { setBooked(false); setStep(0); setSelectedDate(null); setSelectedTime(null); setSelectedMethod(null); }}>
            새 상담 예약
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>돌아가기</Button>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>상담 예약</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        원하시는 날짜와 시간, 상담 방법을 선택해주세요.
      </Typography>

      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      <Card sx={{ borderRadius: '12px' }}>
        <CardContent sx={{ p: 3 }}>
          {step === 0 && (
            <Box>
              {/* ── Calendar ── */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon fontSize="small" color="primary" /> 날짜 선택
              </Typography>

              <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E5E7EB', mb: 3 }}>
                {/* Month navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <IconButton size="small" onClick={handlePrevMonth} disabled={!canGoPrev}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="subtitle1" fontWeight={700}>{monthLabel}</Typography>
                  <IconButton size="small" onClick={handleNextMonth}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>

                {/* Day-of-week headers */}
                <Grid container columns={7} sx={{ mb: 0.5 }}>
                  {DAY_NAMES.map((name, i) => (
                    <Grid item xs={1} key={name} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" fontWeight={600}
                        color={i === 0 ? 'error.main' : i === 6 ? 'primary.main' : 'text.secondary'}>
                        {name}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar grid */}
                <Grid container columns={7}>
                  {calendarDays.map((cell, idx) => (
                    <Grid item xs={1} key={idx} sx={{ textAlign: 'center', py: 0.25 }}>
                      {cell ? (
                        <Box
                          onClick={() => {
                            if (!cell.disabled) {
                              setSelectedDate(cell.dateStr);
                              setSelectedTime(null);
                            }
                          }}
                          sx={{
                            width: 36, height: 36, mx: 'auto', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: cell.disabled ? 'default' : 'pointer',
                            bgcolor: selectedDate === cell.dateStr ? '#0047BA' : 'transparent',
                            color: selectedDate === cell.dateStr
                              ? '#fff'
                              : cell.disabled
                                ? '#D1D5DB'
                                : cell.dayOfWeek === 0 ? '#DC2626' : cell.dayOfWeek === 6 ? '#0047BA' : 'text.primary',
                            fontWeight: selectedDate === cell.dateStr ? 700 : 400,
                            fontSize: '0.875rem',
                            transition: 'all 0.15s',
                            '&:hover': cell.disabled ? {} : {
                              bgcolor: selectedDate === cell.dateStr ? '#0047BA' : '#EBF0FA',
                            },
                          }}
                        >
                          {cell.day}
                        </Box>
                      ) : null}
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* ── Time Selection ── */}
              {selectedDate && (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="primary" /> 시간 선택
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {selectedDate} — 30분 단위로 선택 가능합니다
                  </Typography>

                  {checkingAvailability ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, gap: 1.5 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">가용 시간을 확인 중입니다...</Typography>
                    </Box>
                  ) : (
                    <>
                      {!hasAnyAvailableSlot && Object.keys(availabilityMap).length > 0 && (
                        <Alert severity="warning" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: '8px' }}>
                          이 날짜에는 가용한 강사가 없습니다. 다른 날짜를 선택해주세요.
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                            No instructor available on this date. Please select another date.
                          </Typography>
                        </Alert>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {ALL_TIMES.map((t) => {
                          const isBooked = bookedSlots.includes(t);
                          const hasInstructor = availabilityMap[t] === true;
                          const isDisabled = isBooked || !hasInstructor;
                          const isSelected = selectedTime === t;

                          return (
                            <Chip
                              key={t}
                              label={t}
                              disabled={isDisabled}
                              onClick={() => !isDisabled && setSelectedTime(t)}
                              sx={{
                                fontWeight: 600, fontSize: '0.8rem', height: 36, minWidth: 72,
                                border: '2px solid',
                                borderColor: isSelected ? '#0047BA' : 'transparent',
                                bgcolor: isSelected ? '#EBF0FA' : isDisabled ? '#F3F4F6' : '#F8F9FA',
                                color: isDisabled ? 'text.disabled' : 'text.primary',
                                '&.Mui-disabled': {
                                  opacity: 0.5,
                                },
                              }}
                            />
                          );
                        })}
                      </Box>

                      {selectedTime && !availabilityMap[selectedTime] && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
                          <Typography variant="body2" fontWeight={600}>
                            가용한 강사가 없습니다
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            No instructor available
                          </Typography>
                        </Alert>
                      )}
                    </>
                  )}
                </>
              )}
            </Box>
          )}

          {step === 1 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>상담 방법을 선택해주세요</Typography>
              <Grid container spacing={2}>
                {METHODS.map((m) => (
                  <Grid item xs={12} sm={4} key={m.value}>
                    <Paper
                      elevation={0}
                      onClick={() => setSelectedMethod(m.value)}
                      sx={{
                        p: 3, borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                        border: '2px solid',
                        borderColor: selectedMethod === m.value ? m.color : '#E5E7EB',
                        bgcolor: selectedMethod === m.value ? `${m.color}08` : '#fff',
                        '&:hover': { borderColor: m.color },
                      }}
                    >
                      {React.cloneElement(m.icon, { sx: { fontSize: 36, color: m.color, mb: 1 } })}
                      <Typography variant="subtitle1" fontWeight={600}>{m.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.desc}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
                예약 접수 후 관리자가 적합한 상담사를 배정해드립니다.
              </Alert>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">신청자</Typography>
                    <Typography variant="body2" fontWeight={600}>{user?.name_ko}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">날짜</Typography>
                    <Typography variant="body1" fontWeight={700} color="primary">{selectedDate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">시간</Typography>
                    <Typography variant="body1" fontWeight={700} color="primary">{selectedTime}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">상담 방법</Typography>
                    <Chip icon={METHODS.find((m) => m.value === selectedMethod)?.icon} label={selectedMethod} size="small" sx={{ fontWeight: 600 }} />
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>이전</Button>
        {step < 2 ? (
          <Button variant="contained" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>다음</Button>
        ) : (
          <Button variant="contained" onClick={handleBook} sx={{ px: 4 }}>예약 접수하기</Button>
        )}
      </Box>
    </Box>
  );
};

export default ConsultationBooking;
