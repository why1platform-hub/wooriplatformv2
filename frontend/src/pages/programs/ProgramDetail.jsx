import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  Skeleton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  NotificationsActive as NotifyIcon,
} from '@mui/icons-material';
import { programsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const APPLICATIONS_KEY = 'woori_program_applications';
const NOTIFICATIONS_KEY = 'woori_program_notifications';

const loadApplications = () => {
  try {
    const saved = localStorage.getItem(APPLICATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveApplications = (apps) => {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
};

const loadNotifications = () => {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveNotifications = (notifs) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
};

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [applied, setApplied] = useState(false);
  const [notified, setNotified] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(0);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await programsAPI.getById(id);
        setProgram(response.data.program);
      } catch {
        setProgram({
          id,
          title_ko: '은퇴 후 자산 관리 심화 과정',
          title_en: 'Advanced Asset Management After Retirement',
          category: '금융컨설팅',
          status: '모집중',
          description_ko: `본 과정은 은퇴를 앞두고 있거나 이미 은퇴한 분들을 위한 자산 관리 심화 프로그램입니다.

주요 내용:
- 은퇴 후 소득 원천 다변화 전략
- 부동산 및 금융자산 포트폴리오 관리
- 세금 최적화 및 상속 계획
- 안정적인 현금흐름 창출 방법

본 과정을 통해 은퇴 후에도 안정적인 재무 생활을 영위할 수 있는 역량을 키울 수 있습니다.`,
          recruitment_start: '2026-01-05',
          recruitment_end: '2026-01-25',
          program_start: '2026-02-01',
          program_end: '2026-02-28',
          location: '우리은행 본점 교육관',
          max_participants: 30,
          current_participants: 12,
          instructor: '김재무 전문위원',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  // Check if already applied or notified
  useEffect(() => {
    if (!program) return;
    const apps = loadApplications();
    const existing = apps.find((a) => String(a.programId) === String(id) && a.status !== '취소');
    setApplied(!!existing);
    setCurrentParticipants(program.current_participants || 0);

    const notifs = loadNotifications();
    setNotified(notifs.includes(String(id)));
  }, [program, id]);

  const isFull = currentParticipants >= (program?.max_participants || 30);
  const capacityPercent = Math.min(100, (currentParticipants / (program?.max_participants || 30)) * 100);

  const handleApply = () => {
    setConfirmOpen(true);
  };

  const confirmApply = async () => {
    try {
      await programsAPI.apply(id, {});
    } catch {
      // mock mode
    }
    const apps = loadApplications();
    apps.push({
      id: Date.now(),
      programId: String(id),
      title: program.title_ko || program.title,
      category: program.category,
      status: '승인대기',
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    });
    saveApplications(apps);
    setApplied(true);
    setCurrentParticipants((p) => p + 1);
    setConfirmOpen(false);
    showSuccess('프로그램 신청이 완료되었습니다!');
  };

  const handleCancel = () => {
    setCancelOpen(true);
  };

  const confirmCancel = () => {
    const apps = loadApplications();
    const updated = apps.map((a) =>
      String(a.programId) === String(id) && a.status !== '취소'
        ? { ...a, status: '취소' }
        : a
    );
    saveApplications(updated);
    setApplied(false);
    setCurrentParticipants((p) => Math.max(0, p - 1));
    setCancelOpen(false);
    showSuccess('신청이 취소되었습니다.');
  };

  const handleNotify = () => {
    const notifs = loadNotifications();
    if (!notifs.includes(String(id))) {
      notifs.push(String(id));
      saveNotifications(notifs);
      setNotified(true);
      showSuccess('자리가 나면 알림을 보내드리겠습니다.');
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!program) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          프로그램을 찾을 수 없습니다
        </Typography>
        <Button onClick={() => navigate('/programs')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/programs')}
        sx={{ mb: 2 }}
      >
        목록으로
      </Button>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <CategoryBadge category={program.category} />
                  <StatusBadge status={program.status} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {program.title_ko || program.title}
                </Typography>
                {program.title_en && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {program.title_en}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">모집 기간</Typography>
                      <Typography variant="body2">
                        {program.recruitment_start} ~ {program.recruitment_end}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">프로그램 기간</Typography>
                      <Typography variant="body2">
                        {program.program_start} ~ {program.program_end}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">장소</Typography>
                      <Typography variant="body2">{program.location || '온라인'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">담당 강사</Typography>
                      <Typography variant="body2">{program.instructor || '미정'}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                프로그램 소개
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {program.description_ko || program.description || '상세 설명이 없습니다.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar - Application */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                신청 현황
              </Typography>

              {/* Participant count */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GroupIcon color="action" />
                <Typography variant="body2" fontWeight={500}>
                  {currentParticipants} / {program.max_participants || 30}명 신청
                </Typography>
              </Box>

              {/* Progress bar */}
              <Box sx={{ mb: 2.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={capacityPercent}
                  sx={{
                    height: 10, borderRadius: 5,
                    bgcolor: '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: isFull ? '#DC2626' : '#0047BA',
                      borderRadius: 5,
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {isFull ? '마감' : `${Math.round(capacityPercent)}% 모집 완료`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    잔여 {Math.max(0, (program.max_participants || 30) - currentParticipants)}석
                  </Typography>
                </Box>
              </Box>

              {/* Status alerts */}
              {applied && (
                <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2, fontSize: '0.85rem' }}>
                  신청 완료! 승인 결과를 기다려주세요.
                </Alert>
              )}

              {/* Action buttons */}
              {program.status === '종료' ? (
                <Button fullWidth variant="contained" size="large" disabled sx={{ py: 1.5 }}>
                  모집 마감
                </Button>
              ) : applied ? (
                <Button
                  fullWidth variant="outlined" color="error" size="large"
                  onClick={handleCancel}
                  sx={{ py: 1.5 }}
                >
                  신청 취소
                </Button>
              ) : isFull ? (
                <Button
                  fullWidth variant="contained" size="large"
                  startIcon={<NotifyIcon />}
                  disabled={notified}
                  onClick={handleNotify}
                  sx={{
                    py: 1.5,
                    bgcolor: notified ? '#9CA3AF' : '#D97706',
                    '&:hover': { bgcolor: '#B45309' },
                  }}
                >
                  {notified ? '알림 신청 완료' : '자리 나면 알림 받기'}
                </Button>
              ) : (
                <Button
                  fullWidth variant="contained" size="large"
                  onClick={handleApply}
                  sx={{ py: 1.5 }}
                >
                  신청하기
                </Button>
              )}

              {!applied && !isFull && program.status !== '종료' && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  선착순 모집 · 별도 서류 없이 바로 신청
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Apply Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>프로그램 신청</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            <strong>"{program.title_ko || program.title}"</strong> 프로그램을 신청하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            현재 {currentParticipants}/{program.max_participants || 30}명 신청 중
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>취소</Button>
          <Button variant="contained" onClick={confirmApply}>신청하기</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>신청 취소</DialogTitle>
        <DialogContent>
          <Typography>
            "{program.title_ko || program.title}" 프로그램 신청을 취소하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCancelOpen(false)}>돌아가기</Button>
          <Button variant="contained" color="error" onClick={confirmCancel}>신청 취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramDetail;
