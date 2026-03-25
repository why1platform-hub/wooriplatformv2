import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Stepper, Step, StepLabel,
  Chip, Paper, Divider, Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Videocam as OnlineIcon,
  LocationOn as OfflineIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { addBooking, getAvailableSlots, getBookedSlots, getKSTDate, formatKSTDate } from '../../utils/consultationStore';

const STEPS = ['날짜 · 시간 선택', '상담 방법 선택', '예약 확인'];

const METHODS = [
  { value: '온라인', icon: <OnlineIcon />, color: '#0047BA', desc: '화상 회의로 진행' },
  { value: '오프라인', icon: <OfflineIcon />, color: '#059669', desc: '우리은행 본점 상담실' },
  { value: '전화', icon: <PhoneIcon />, color: '#EA580C', desc: '유선 통화로 진행' },
];

const ConsultationBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess } = useNotification();

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [booked, setBooked] = useState(false);

  // Generate next 14 weekdays
  // Generate next 14 weekdays in KST
  const dates = useMemo(() => {
    const result = [];
    const kstNow = getKSTDate();
    const d = new Date(kstNow);
    d.setDate(d.getDate() + 1);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    while (result.length < 14) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        result.push({ date: formatKSTDate(d), label: `${d.getMonth() + 1}/${d.getDate()}`, day: dayNames[day] });
      }
      d.setDate(d.getDate() + 1);
    }
    return result;
  }, []);

  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const all = getAvailableSlots(selectedDate);
      const booked = await getBookedSlots(selectedDate);
      if (!cancelled) {
        setTimeSlots(all.map((t) => ({ time: t, available: !booked.includes(t) })));
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDate]);

  const canNext = () => {
    if (step === 0) return selectedDate && selectedTime;
    if (step === 1) return selectedMethod;
    return true;
  };

  const handleBook = async () => {
    await addBooking({
      userId: user.id,
      userName: user.name_ko,
      userEmail: user.email,
      date: selectedDate,
      time: selectedTime,
      method: selectedMethod,
    });
    setBooked(true);
    showSuccess('상담 예약이 접수되었습니다!');
  };

  if (booked) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center', py: 6 }}>
        <CheckIcon sx={{ fontSize: 56, color: '#059669', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>예약 접수 완료</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          관리자가 상담사를 배정한 후 확정 안내를 드리겠습니다.
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
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">상태</Typography>
              <Chip label="배정 대기" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
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
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon fontSize="small" color="primary" /> 날짜 선택
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {dates.map((d) => (
                  <Paper
                    key={d.date} elevation={0}
                    onClick={() => { setSelectedDate(d.date); setSelectedTime(null); }}
                    sx={{
                      px: 2, py: 1.5, borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                      border: '2px solid', minWidth: 64,
                      borderColor: selectedDate === d.date ? '#0047BA' : '#E5E7EB',
                      bgcolor: selectedDate === d.date ? '#EBF0FA' : '#fff',
                      '&:hover': { borderColor: '#0047BA' },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">{d.day}</Typography>
                    <Typography variant="body2" fontWeight={600}>{d.label}</Typography>
                  </Paper>
                ))}
              </Box>

              {selectedDate && (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="primary" /> 시간 선택
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {timeSlots.map((s) => (
                      <Chip
                        key={s.time} label={s.time} disabled={!s.available}
                        onClick={() => s.available && setSelectedTime(s.time)}
                        sx={{
                          fontWeight: 600, fontSize: '0.8rem', height: 36, minWidth: 72,
                          border: '2px solid',
                          borderColor: selectedTime === s.time ? '#0047BA' : 'transparent',
                          bgcolor: selectedTime === s.time ? '#EBF0FA' : s.available ? '#F8F9FA' : '#F3F4F6',
                          color: s.available ? 'text.primary' : 'text.disabled',
                        }}
                      />
                    ))}
                  </Box>
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
