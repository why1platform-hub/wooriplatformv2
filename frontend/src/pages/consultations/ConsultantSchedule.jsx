import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CalendarMonth as CalendarIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  EventAvailable as AvailableIcon,
  EventBusy as BookedIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { consultationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TIME_SLOTS = [];
for (let h = 9; h < 17; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

const ConsultantSchedule = () => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week').add(1, 'day')); // Monday
  const [mySlots, setMySlots] = useState([]);
  const [, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  // Generate week days (Mon-Fri)
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      days.push(currentWeek.add(i, 'day'));
    }
    return days;
  }, [currentWeek]);

  // Mock data for existing slots
  const generateMockSlots = () => {
    const slots = [];
    weekDays.forEach((day) => {
      const times = TIME_SLOTS.filter(() => Math.random() > 0.7);
      times.forEach((time) => {
        const [h, m] = time.split(':').map(Number);
        const endTime = `${String(h + (m === 30 ? 1 : 0)).padStart(2, '0')}:${m === 30 ? '00' : '30'}`;
        const isBooked = Math.random() > 0.6;
        slots.push({
          id: `slot-${day.format('YYYY-MM-DD')}-${time}`,
          consultant_id: user?.id || 'me',
          available_date: day.format('YYYY-MM-DD'),
          start_time: time,
          end_time: endTime,
          is_booked: isBooked,
          booked_by_name: isBooked ? ['홍길동', '김철수', '이영희', '박민수'][Math.floor(Math.random() * 4)] : null,
        });
      });
    });
    return slots;
  };

  // Use mock data directly to avoid 401 redirect from non-existent backend
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setMySlots(generateMockSlots());
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  const getSlotForCell = (date, time) => {
    return mySlots.find(
      (s) => s.available_date === date.format('YYYY-MM-DD') && s.start_time === time
    );
  };

  const toggleSelect = (date, time) => {
    const key = `${date.format('YYYY-MM-DD')}_${time}`;
    const existing = getSlotForCell(date, time);
    if (existing) return; // Can't select already published slots
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handlePublish = async () => {
    if (selectedSlots.size === 0) return;
    setSaving(true);
    try {
      const slots = Array.from(selectedSlots).map((key) => {
        const [date, time] = key.split('_');
        const [h, m] = time.split(':').map(Number);
        const endTime = `${String(h + (m === 30 ? 1 : 0)).padStart(2, '0')}:${m === 30 ? '00' : '30'}`;
        return { date, start_time: time, end_time: endTime };
      });
      await consultationsAPI.publishAvailability({ slots });
      // Add to local state
      const newSlots = slots.map((s) => ({
        id: `new-${s.date}-${s.start_time}`,
        consultant_id: user?.id || 'me',
        available_date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
        is_booked: false,
      }));
      setMySlots((prev) => [...prev, ...newSlots]);
      setSelectedSlots(new Set());
      setSuccess('시간이 성공적으로 등록되었습니다!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setSuccess('시간이 등록되었습니다. (데모)');
      const newSlots = Array.from(selectedSlots).map((key) => {
        const [date, time] = key.split('_');
        const [h, m] = time.split(':').map(Number);
        const endTime = `${String(h + (m === 30 ? 1 : 0)).padStart(2, '0')}:${m === 30 ? '00' : '30'}`;
        return {
          id: `new-${date}-${time}`,
          consultant_id: user?.id || 'me',
          available_date: date,
          start_time: time,
          end_time: endTime,
          is_booked: false,
        };
      });
      setMySlots((prev) => [...prev, ...newSlots]);
      setSelectedSlots(new Set());
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    try {
      await consultationsAPI.deleteAvailability(slotToDelete.id);
    } catch {
      // demo mode
    }
    setMySlots((prev) => prev.filter((s) => s.id !== slotToDelete.id));
    setSlotToDelete(null);
    setConfirmDeleteOpen(false);
  };

  // Summary stats
  const totalSlots = mySlots.length;
  const bookedSlots = mySlots.filter((s) => s.is_booked).length;
  const availableCount = totalSlots - bookedSlots;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            상담 일정 관리
          </Typography>
          <Typography variant="body2" color="text.secondary">
            상담 가능 시간을 등록하고 관리하세요. 셀을 클릭하여 30분 단위로 시간을 등록할 수 있습니다.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handlePublish}
          disabled={selectedSlots.size === 0 || saving}
        >
          {selectedSlots.size > 0 ? `${selectedSlots.size}개 시간 등록` : '시간 등록'}
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: '이번 주 등록', value: `${totalSlots}개`, color: '#0047BA', bg: '#EBF0FA', icon: <CalendarIcon /> },
          { label: '예약됨', value: `${bookedSlots}개`, color: '#059669', bg: '#ECFDF5', icon: <BookedIcon /> },
          { label: '대기중', value: `${availableCount}개`, color: '#EA580C', bg: '#FFF7ED', icon: <AvailableIcon /> },
        ].map((stat) => (
          <Grid item xs={4} key={stat.label}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Week Navigation */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => setCurrentWeek((w) => w.subtract(7, 'day'))}>
                <PrevIcon />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={600}>
                {weekDays[0].format('YYYY년 MM월 DD일')} ~ {weekDays[4].format('MM월 DD일')}
              </Typography>
              <IconButton onClick={() => setCurrentWeek((w) => w.add(7, 'day'))}>
                <NextIcon />
              </IconButton>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCurrentWeek(dayjs().startOf('week').add(1, 'day'))}
            >
              이번 주
            </Button>
          </Box>

          {/* Time Grid */}
          <TableContainer sx={{ maxHeight: 560, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 70, fontWeight: 600, fontSize: '0.8rem', bgcolor: '#F8F9FA' }}>시간</TableCell>
                  {weekDays.map((day) => (
                    <TableCell
                      key={day.format('YYYY-MM-DD')}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        bgcolor: day.isSame(dayjs(), 'day') ? alpha('#0047BA', 0.06) : '#F8F9FA',
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>{day.format('ddd')}</Typography>
                      <br />
                      <Typography variant="caption" color={day.isSame(dayjs(), 'day') ? 'primary' : 'text.secondary'}>
                        {day.format('MM/DD')}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {TIME_SLOTS.map((time) => (
                  <TableRow key={time}>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary', py: 1 }}>
                      {time}
                    </TableCell>
                    {weekDays.map((day) => {
                      const slot = getSlotForCell(day, time);
                      const isPast = day.isBefore(dayjs(), 'day');
                      const key = `${day.format('YYYY-MM-DD')}_${time}`;
                      const isSelected = selectedSlots.has(key);

                      let cellContent;
                      let cellSx = {
                        cursor: isPast ? 'default' : 'pointer',
                        transition: 'all 0.1s ease',
                        py: 0.75,
                        borderLeft: '1px solid #F0F0F0',
                      };

                      if (slot?.is_booked) {
                        cellContent = (
                          <Tooltip title={`예약됨: ${slot.booked_by_name || '사용자'}`}>
                            <Chip
                              size="small"
                              icon={<PersonIcon sx={{ fontSize: '12px !important' }} />}
                              label={slot.booked_by_name || '예약됨'}
                              sx={{ height: 24, fontSize: '0.65rem', bgcolor: '#DCFCE7', color: '#166534', fontWeight: 500, '& .MuiChip-icon': { color: '#166534' } }}
                            />
                          </Tooltip>
                        );
                        cellSx.bgcolor = alpha('#059669', 0.04);
                      } else if (slot) {
                        cellContent = (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Chip
                              size="small"
                              label="대기"
                              sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha('#0047BA', 0.08), color: '#0047BA' }}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); setSlotToDelete(slot); setConfirmDeleteOpen(true); }}
                              sx={{ p: 0.25 }}
                            >
                              <DeleteIcon sx={{ fontSize: 14, color: '#DC2626' }} />
                            </IconButton>
                          </Box>
                        );
                        cellSx.bgcolor = alpha('#0047BA', 0.03);
                      } else if (isSelected) {
                        cellContent = (
                          <Chip
                            size="small"
                            icon={<CheckIcon sx={{ fontSize: '12px !important' }} />}
                            label="선택됨"
                            sx={{ height: 22, fontSize: '0.65rem', bgcolor: '#0047BA', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
                          />
                        );
                        cellSx.bgcolor = alpha('#0047BA', 0.08);
                      } else {
                        cellContent = null;
                        if (!isPast) {
                          cellSx['&:hover'] = { bgcolor: alpha('#0047BA', 0.06) };
                        }
                      }

                      return (
                        <TableCell
                          key={day.format('YYYY-MM-DD')}
                          align="center"
                          sx={cellSx}
                          onClick={() => !isPast && !slot && toggleSelect(day, time)}
                        >
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 3, mt: 2, pt: 2, borderTop: '1px solid #E5E5E5' }}>
            {[
              { color: alpha('#0047BA', 0.08), border: '#0047BA', label: '선택됨 (미저장)' },
              { color: alpha('#0047BA', 0.03), border: '#0047BA', label: '등록됨 (대기중)' },
              { color: alpha('#059669', 0.04), border: '#059669', label: '예약됨' },
            ].map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: item.color, border: `1px solid ${item.border}` }} />
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>시간 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            {slotToDelete?.available_date} {slotToDelete?.start_time} ~ {slotToDelete?.end_time} 시간을 삭제하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={handleDeleteSlot}>삭제</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultantSchedule;
