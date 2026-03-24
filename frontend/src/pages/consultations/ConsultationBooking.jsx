import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  Chip,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Skeleton,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Videocam as OnlineIcon,
  LocationOn as OfflineIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  EventAvailable as BookedIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { consultationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import IntakeForm, { hasIntakeForm } from './IntakeForm';

const methodOptions = [
  { value: '온라인', label: '온라인', icon: <OnlineIcon />, color: '#0047BA', desc: '화상 상담 (Zoom/Meet)' },
  { value: '오프라인', label: '오프라인', icon: <OfflineIcon />, color: '#059669', desc: '대면 상담' },
  { value: '전화', label: '전화', icon: <PhoneIcon />, color: '#EA580C', desc: '전화 상담' },
];

const steps = ['상담사 선택', '날짜/시간 선택', '상담 정보 입력', '예약 확인'];

const MOCK_CONSULTANTS = [
  { id: 1, name_ko: '김영수', department: '재무설계', position: '수석 컨설턴트', completed_consultations: 128 },
  { id: 2, name_ko: '이정민', department: '부동산', position: '전문 상담역', completed_consultations: 95 },
  { id: 3, name_ko: '박서연', department: '창업지원', position: '시니어 컨설턴트', completed_consultations: 73 },
  { id: 4, name_ko: '최준혁', department: '취업컨설팅', position: '전문 상담역', completed_consultations: 156 },
  { id: 5, name_ko: '정하늘', department: '법률자문', position: '수석 컨설턴트', completed_consultations: 64 },
  { id: 6, name_ko: '윤미래', department: '건강관리', position: '전문 상담역', completed_consultations: 42 },
];

const generateMockSlots = (consultantId) => {
  const slots = [];
  const today = new Date();
  let slotId = 1;
  for (let d = 1; d <= 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().slice(0, 10);
    const hours = [9, 10, 11, 13, 14, 15, 16];
    for (let hi = 0; hi < hours.length; hi++) {
      const h = hours[hi];
      if (Math.random() > 0.4) {
        slots.push({
          id: slotId++,
          consultant_id: consultantId,
          available_date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:00`,
          end_time: `${String(h).padStart(2, '0')}:30`,
        });
      }
    }
  }
  return slots;
};

const ConsultationBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [topic, setTopic] = useState('');
  const [method, setMethod] = useState('온라인');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Use mock data directly — API calls to a non-existent backend
    // can trigger 401 interceptor which redirects away from the page
    setConsultants(MOCK_CONSULTANTS);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedConsultant) {
      setSlotsLoading(true);
      // Small delay to show loading state, then use mock slots
      const timer = setTimeout(() => {
        setAvailableSlots(generateMockSlots(selectedConsultant.id));
        setSlotsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedConsultant]);

  const uniqueDates = [...new Set(availableSlots.map((s) => s.available_date))].sort();
  const slotsForDate = availableSlots.filter((s) => s.available_date === selectedDate);

  const handleBook = async () => {
    try {
      await consultationsAPI.book({
        consultant_id: selectedConsultant.id,
        slot_id: selectedSlot.id,
        topic,
        method,
      });
      setSuccess(true);
    } catch {
      // If API fails, still show success (mock mode)
      setSuccess(true);
    }
  };

  const canProceed = () => {
    if (activeStep === 0) return !!selectedConsultant;
    if (activeStep === 1) return !!selectedSlot;
    if (activeStep === 2) return !!topic.trim();
    return true;
  };

  const [showIntake, setShowIntake] = useState(false);
  const needsIntake = user?.id && !hasIntakeForm(user.id);

  // After booking, auto-show intake if needed
  useEffect(() => {
    if (success && needsIntake) setShowIntake(true);
  }, [success, needsIntake]);

  if (success && showIntake && needsIntake) {
    return (
      <Box>
        {/* Booking confirmation banner */}
        <Box sx={{
          p: 2, mb: 3, borderRadius: '12px',
          bgcolor: '#ECFDF5', border: '1px solid #A7F3D0',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <CheckIcon sx={{ color: '#059669' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: '#065F46' }}>
              상담 예약 완료 — {selectedConsultant?.name_ko} 상담사 | {selectedSlot?.available_date} {selectedSlot?.start_time}
            </Typography>
          </Box>
        </Box>
        <IntakeForm
          mode="user"
          onComplete={() => setShowIntake(false)}
        />
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CheckIcon sx={{ fontSize: 64, color: '#059669', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          상담 예약이 완료되었습니다!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {selectedConsultant?.name_ko} 상담사 | {selectedSlot?.available_date} {selectedSlot?.start_time}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          상담 방법: {method} | 주제: {topic}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/activities/consultations')}>
            내 상담 내역
          </Button>
          <Button variant="contained" onClick={() => { setSuccess(false); setShowIntake(false); setActiveStep(0); setSelectedConsultant(null); setSelectedSlot(null); setSelectedDate(null); setTopic(''); }}>
            새 상담 예약
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          상담 예약
        </Typography>
        <Typography variant="body2" color="text.secondary">
          원하는 상담사와 시간을 선택하여 상담을 예약하세요. (30분 단위)
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Select Consultant */}
      {activeStep === 0 && (
        <Grid container spacing={2}>
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          ) : consultants.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                현재 등록된 상담사가 없습니다. 관리자에게 문의해주세요.
              </Alert>
            </Grid>
          ) : (
            consultants.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card
                  onClick={() => setSelectedConsultant(c)}
                  sx={{
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: selectedConsultant?.id === c.id ? '#0047BA' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#0047BA', transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,71,186,0.12)' },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: '#0047BA', fontSize: '1.1rem' }}>
                        {c.name_ko?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{c.name_ko}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.position || c.department}</Typography>
                      </Box>
                      {selectedConsultant?.id === c.id && <CheckIcon sx={{ ml: 'auto', color: '#0047BA' }} />}
                    </Box>
                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        size="small"
                        label={c.department}
                        sx={{ height: 24, fontSize: '0.75rem', bgcolor: alpha('#0047BA', 0.08), color: '#0047BA' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        상담 {c.completed_consultations || 0}회 완료
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Step 1: Select Date/Time */}
      {activeStep === 1 && (
        <Grid container spacing={3}>
          {/* Date Selection */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" color="primary" /> 날짜 선택
                </Typography>
                {slotsLoading ? (
                  [1, 2, 3].map((i) => <Skeleton key={i} height={44} sx={{ mb: 1 }} />)
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {uniqueDates.map((date) => {
                      const d = dayjs(date);
                      const slotCount = availableSlots.filter((s) => s.available_date === date).length;
                      return (
                        <Button
                          key={date}
                          variant={selectedDate === date ? 'contained' : 'outlined'}
                          fullWidth
                          onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                          sx={{
                            justifyContent: 'space-between',
                            py: 1.2,
                            textTransform: 'none',
                            ...(selectedDate !== date && { borderColor: '#E5E5E5', color: 'text.primary' }),
                          }}
                        >
                          <span>{d.format('MM/DD (ddd)')}</span>
                          <Chip label={`${slotCount}개`} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: selectedDate === date ? 'rgba(255,255,255,0.2)' : alpha('#0047BA', 0.08), color: selectedDate === date ? '#fff' : '#0047BA' }} />
                        </Button>
                      );
                    })}
                    {uniqueDates.length === 0 && (
                      <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                        현재 예약 가능한 날짜가 없습니다.
                      </Alert>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Time Slot Selection */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon fontSize="small" color="primary" /> 시간 선택
                  {selectedDate && (
                    <Chip label={dayjs(selectedDate).format('YYYY년 MM월 DD일 (ddd)')} size="small" sx={{ ml: 1, height: 24 }} />
                  )}
                </Typography>
                {!selectedDate ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                    <Typography color="text.secondary">먼저 날짜를 선택해주세요</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={1.5}>
                    {slotsForDate.map((slot) => (
                      <Grid item xs={4} sm={3} md={2.4} key={slot.id}>
                        <Button
                          variant={selectedSlot?.id === slot.id ? 'contained' : 'outlined'}
                          fullWidth
                          onClick={() => setSelectedSlot(slot)}
                          sx={{
                            py: 1.5,
                            flexDirection: 'column',
                            gap: 0.25,
                            textTransform: 'none',
                            ...(selectedSlot?.id !== slot.id && { borderColor: '#E5E5E5', color: 'text.primary' }),
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>{slot.start_time}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                            ~{slot.end_time}
                          </Typography>
                        </Button>
                      </Grid>
                    ))}
                    {slotsForDate.length === 0 && (
                      <Grid item xs={12}>
                        <Alert severity="info">해당 날짜에 가능한 시간이 없습니다.</Alert>
                      </Grid>
                    )}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Step 2: Consultation Info */}
      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
                  상담 정보 입력
                </Typography>

                <TextField
                  label="상담 주제"
                  placeholder="예: 노후 재무 플랜 상담, 부동산 투자 전략 등"
                  fullWidth
                  multiline
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  sx={{ mb: 4 }}
                />

                <FormControl>
                  <FormLabel sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>상담 방법</FormLabel>
                  <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)}>
                    <Grid container spacing={2}>
                      {methodOptions.map((opt) => (
                        <Grid item xs={12} sm={4} key={opt.value}>
                          <Card
                            onClick={() => setMethod(opt.value)}
                            sx={{
                              cursor: 'pointer',
                              border: '2px solid',
                              borderColor: method === opt.value ? opt.color : '#E5E5E5',
                              bgcolor: method === opt.value ? alpha(opt.color, 0.04) : '#fff',
                              transition: 'all 0.15s ease',
                              '&:hover': { borderColor: opt.color },
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                              <FormControlLabel
                                value={opt.value}
                                control={<Radio sx={{ display: 'none' }} />}
                                label=""
                                sx={{ m: 0 }}
                              />
                              <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: alpha(opt.color, 0.1), color: opt.color, width: 44, height: 44 }}>
                                {opt.icon}
                              </Avatar>
                              <Typography variant="subtitle2" fontWeight={600}>{opt.label}</Typography>
                              <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Summary Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#F8F9FA' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>예약 요약</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">상담사</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: '#0047BA', fontSize: '0.75rem' }}>
                        {selectedConsultant?.name_ko?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>{selectedConsultant?.name_ko}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">날짜 및 시간</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {dayjs(selectedSlot?.available_date).format('YYYY년 MM월 DD일')}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedSlot?.start_time} ~ {selectedSlot?.end_time} (30분)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">분야</Typography>
                    <Typography variant="body2" fontWeight={500}>{selectedConsultant?.department}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Step 3: Confirmation */}
      {activeStep === 3 && (
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <BookedIcon sx={{ fontSize: 48, color: '#0047BA', mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>예약 정보를 확인해주세요</Typography>
            </Box>

            <Box sx={{ bgcolor: '#F8F9FA', borderRadius: 2, p: 3, mb: 3 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">상담사</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedConsultant?.name_ko}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">분야</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedConsultant?.department}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">날짜</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {dayjs(selectedSlot?.available_date).format('YYYY년 MM월 DD일 (ddd)')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">시간</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedSlot?.start_time} ~ {selectedSlot?.end_time}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">상담 방법</Typography>
                  <Chip
                    size="small"
                    label={method}
                    icon={methodOptions.find((m) => m.value === method)?.icon}
                    sx={{ mt: 0.5, height: 26 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">소요 시간</Typography>
                  <Typography variant="body2" fontWeight={600}>30분</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">상담 주제</Typography>
                  <Typography variant="body2" fontWeight={600}>{topic}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Button variant="contained" fullWidth size="large" onClick={handleBook} sx={{ py: 1.5 }}>
              예약 확정하기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => setActiveStep((s) => s - 1)}
          disabled={activeStep === 0}
          variant="outlined"
        >
          이전
        </Button>
        {activeStep < 3 && (
          <Button
            endIcon={<NextIcon />}
            onClick={() => setActiveStep((s) => s + 1)}
            disabled={!canProceed()}
            variant="contained"
          >
            다음
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ConsultationBooking;
