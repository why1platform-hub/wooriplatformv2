import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Grid, LinearProgress, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Divider, Avatar, IconButton, TextField, Paper,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  EventNote as EventIcon,
  Close as CloseIcon,
  Videocam as OnlineIcon,
  LocationOn as OfflineIcon,
  Phone as PhoneIcon,
  Description as FileIcon,
  TextSnippet as TextIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon,
  School as CourseIcon,
  WorkOutline as JobIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { consultationsAPI } from '../../services/api';
import { getInProgressCourses } from '../../utils/courseStore';
import { loadApplications } from '../../utils/programStore';
import { getBookingsForUser } from '../../utils/consultationStore';
import { getBookmarkedJobs, toggleBookmark } from '../../utils/jobStore';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const methodIcon = {
  '온라인': <OnlineIcon sx={{ fontSize: 14 }} />,
  '오프라인': <OfflineIcon sx={{ fontSize: 14 }} />,
  '전화': <PhoneIcon sx={{ fontSize: 14 }} />,
};

const statusColors = {
  '배정대기': { color: '#92400E', bg: '#FEF3C7' },
  '예약완료': { color: '#1E40AF', bg: '#DBEAFE' },
  '완료': { color: '#166534', bg: '#DCFCE7' },
  '취소': { color: '#991B1B', bg: '#FEE2E2' },
};

// ── Collapsible Section ──
const Section = ({ title, icon, count, children, defaultOpen = true, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', mb: 2, overflow: 'hidden' }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 1.5, cursor: 'pointer', userSelect: 'none',
          bgcolor: open ? '#FAFBFC' : '#fff',
          '&:hover': { bgcolor: '#F5F6F8' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon}
          <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
          {count !== undefined && (
            <Chip label={count} size="small" sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700, bgcolor: '#EBF0FA', color: '#0047BA' }} />
          )}
          {badge}
        </Box>
        {open ? <ExpandLessIcon sx={{ color: '#9CA3AF' }} /> : <ExpandMoreIcon sx={{ color: '#9CA3AF' }} />}
      </Box>
      {open && <Box sx={{ px: 2.5, pb: 2.5 }}>{children}</Box>}
    </Paper>
  );
};

const MyActivities = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Load all data at once
  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [apps, bookings, coursesData, jobs] = await Promise.all([
        loadApplications(),
        getBookingsForUser(user.id),
        getInProgressCourses(),
        getBookmarkedJobs(),
      ]);

      setApplications(apps.filter((a) => a.email === user.email));

      const statusMap = { pending: '배정대기', pending_approval: '배정대기', proposed: '예약완료', confirmed: '예약완료', completed: '완료', rejected: '취소', cancelled: '취소' };
      setConsultations(bookings.map((b) => ({
        id: b.id, rawStatus: b.status,
        date: `${b.date} ${b.time}`, scheduled_at: `${b.date} ${b.time}`,
        consultant: b.consultantName || '배정 대기', consultant_name: b.consultantName || '배정 대기',
        topic: b.method, method: b.method,
        status: statusMap[b.status] || b.status,
        records: [],
      })));

      setCourses(coursesData);
      setBookmarkedJobs(jobs);
    } catch (e) {
      console.error('Failed to fetch activities:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Stats
  const activeApps = applications.filter((a) => a.status !== '취소');
  const nextConsultation = consultations.find((c) => c.status === '예약완료');

  const handleViewDetail = (c) => { setSelectedConsultation(c); setDetailOpen(true); setNewNote(''); };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedConsultation) return;
    try { await consultationsAPI.addRecord(selectedConsultation.id, { record_type: 'text', content: newNote }); } catch { /* demo */ }
    setSelectedConsultation((prev) => ({
      ...prev,
      records: [...(prev.records || []), { id: `new-${Date.now()}`, record_type: 'text', content: newNote, author_name: user?.name_ko || '나', created_at: new Date().toISOString().slice(0, 16).replace('T', ' ') }],
    }));
    setNewNote('');
  };

  const handleCancel = async (consultation) => {
    try { await consultationsAPI.cancel(consultation.id); } catch {
      try { const { supabase } = require('../../utils/supabase'); await supabase.from('consultation_bookings').update({ status: 'cancelled' }).eq('id', consultation.id); } catch { /* ignore */ }
    }
    setConsultations((prev) => prev.map((c) => c.id === consultation.id ? { ...c, status: '취소' } : c));
    setCancelConfirmOpen(false);
    setCancelTarget(null);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{t('activities.title')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>활동 내역</Typography>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '12px' }} />)}
      </Box>
    );
  }

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          {t('activities.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('activities.welcome', { name: (i18n.language === 'en' ? user?.name_en : user?.name_ko) || user?.name_ko || '회원' })}
        </Typography>
      </Box>

      {/* ── Summary Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
            <AssignmentIcon sx={{ color: '#0047BA', fontSize: 28, mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700}>{activeApps.length}</Typography>
            <Typography variant="caption" color="text.secondary">프로그램 신청</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
            <EventIcon sx={{ color: '#7C3AED', fontSize: 28, mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700}>{consultations.length}</Typography>
            <Typography variant="caption" color="text.secondary">상담 기록</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
            <CourseIcon sx={{ color: '#059669', fontSize: 28, mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700}>{courses.length}</Typography>
            <Typography variant="caption" color="text.secondary">수강 중</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
            <JobIcon sx={{ color: '#EA580C', fontSize: 28, mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700}>{bookmarkedJobs.length}</Typography>
            <Typography variant="caption" color="text.secondary">북마크</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Next consultation banner ── */}
      {nextConsultation && (
        <Paper elevation={0} onClick={() => handleViewDetail(nextConsultation)}
          sx={{ p: 2, mb: 3, borderRadius: '10px', border: '1px solid #DBEAFE', bgcolor: '#EFF6FF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: '#DBEAFE' } }}>
          <Box>
            <Typography variant="caption" color="text.secondary">다음 예약 상담</Typography>
            <Typography variant="body1" fontWeight={600}>{nextConsultation.date}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip size="small" icon={methodIcon[nextConsultation.method]} label={nextConsultation.method} sx={{ height: 24 }} />
            <Typography variant="body2" color="text.secondary">{nextConsultation.consultant}</Typography>
          </Box>
        </Paper>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ── 1. 신청내역 (Program Applications) ──────── */}
      {/* ══════════════════════════════════════════════ */}
      <Section title="신청내역" icon={<AssignmentIcon sx={{ color: '#0047BA', fontSize: 20 }} />} count={activeApps.length}>
        {applications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">{t('activities.noApplications')}</Typography>
          </Box>
        ) : isMobile ? (
          <Box>
            {applications.map((app) => (
              <Box key={app.id} sx={{ p: 2, mb: 1, borderRadius: '8px', border: '1px solid #F3F4F6', '&:hover': { bgcolor: '#F9FAFB' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>{app.program_title || app.title}</Typography>
                  <StatusBadge status={app.status} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <CategoryBadge category={app.category} />
                  <Typography variant="caption" color="text.secondary">{app.date || app.applied_at}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>프로그램</TableCell>
                  <TableCell align="center">분야</TableCell>
                  <TableCell align="center">신청일</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center" width={80}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={500}>{app.program_title || app.title}</Typography></TableCell>
                    <TableCell align="center"><CategoryBadge category={app.category} /></TableCell>
                    <TableCell align="center"><Typography variant="body2" color="text.secondary">{app.date || app.applied_at}</Typography></TableCell>
                    <TableCell align="center"><StatusBadge status={app.status} /></TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="text" onClick={() => navigate(`/programs/${app.program_id || app.programId}`)}>보기</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* ── 2. 상담기록 (Consultations) ─────────────── */}
      {/* ══════════════════════════════════════════════ */}
      <Section title="상담기록" icon={<EventIcon sx={{ color: '#7C3AED', fontSize: 20 }} />} count={consultations.length}
        badge={nextConsultation ? <Chip label="예약 있음" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 600 }} /> : null}>
        {consultations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 1.5 }}>{t('activities.noConsultations')}</Typography>
            <Button variant="outlined" size="small" onClick={() => navigate('/consultations/booking')}>{t('activities.firstBooking')}</Button>
          </Box>
        ) : isMobile ? (
          <Box>
            {consultations.map((c) => {
              const sc = statusColors[c.status];
              return (
                <Box key={c.id} onClick={() => handleViewDetail(c)}
                  sx={{ p: 2, mb: 1, borderRadius: '8px', border: '1px solid #F3F4F6', borderLeft: `3px solid ${sc?.color || '#999'}`, cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{c.date}</Typography>
                    <Chip size="small" label={c.status} sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: sc?.bg, color: sc?.color }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">{c.consultant}</Typography>
                    {c.method && <Chip size="small" icon={methodIcon[c.method]} label={c.method} sx={{ height: 20, fontSize: '0.65rem' }} />}
                  </Box>
                  {c.status === '배정대기' && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="small" variant="outlined" color="error" onClick={(e) => { e.stopPropagation(); setCancelTarget(c); setCancelConfirmOpen(true); }}>취소</Button>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>날짜/시간</TableCell>
                  <TableCell>상담사</TableCell>
                  <TableCell align="center">방법</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center" width={120}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consultations.map((c) => {
                  const sc = statusColors[c.status];
                  return (
                    <TableRow key={c.id} hover>
                      <TableCell><Typography variant="body2">{c.date}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{c.consultant}</Typography></TableCell>
                      <TableCell align="center">{c.method && <Chip size="small" icon={methodIcon[c.method]} label={c.method} sx={{ height: 24, fontSize: '0.75rem' }} />}</TableCell>
                      <TableCell align="center"><Chip size="small" label={c.status} sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: sc?.bg, color: sc?.color }} /></TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Button size="small" variant="text" onClick={() => handleViewDetail(c)}>상세</Button>
                          {c.status === '배정대기' && (
                            <Button size="small" variant="text" color="error" onClick={() => { setCancelTarget(c); setCancelConfirmOpen(true); }}>취소</Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="small" variant="contained" onClick={() => navigate('/consultations/booking')}>새 상담 예약</Button>
        </Box>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* ── 3. 수강현황 (Courses) ──────────────────── */}
      {/* ══════════════════════════════════════════════ */}
      <Section title="수강현황" icon={<CourseIcon sx={{ color: '#059669', fontSize: 20 }} />} count={courses.length} defaultOpen={courses.length > 0}>
        {courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">{t('activities.noCourses')}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {courses.map((course) => {
              const progress = course.progress || course.progress_percent || 0;
              const isComplete = progress === 100;
              return (
                <Box key={course.id} onClick={() => navigate(`/learning/${course.course_id || course.id}`)}
                  sx={{
                    p: 2, borderRadius: '8px', cursor: 'pointer', border: '1px solid',
                    borderColor: isComplete ? '#059669' : '#F3F4F6',
                    bgcolor: isComplete ? '#F0FDF4' : '#fff',
                    '&:hover': { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
                  }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{course.title || course.course?.title_ko}</Typography>
                    <Chip label={isComplete ? '완료' : '수강중'} size="small"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: isComplete ? '#DCFCE7' : '#DBEAFE', color: isComplete ? '#166534' : '#1E40AF' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinearProgress variant="determinate" value={progress}
                      sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: isComplete ? '#059669' : '#0047BA', borderRadius: 3 } }} />
                    <Typography variant="caption" fontWeight={600} sx={{ minWidth: 32 }}>{progress}%</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* ── 4. 북마크 (Bookmarked Jobs) ─────────────── */}
      {/* ══════════════════════════════════════════════ */}
      <Section title="북마크" icon={<BookmarkBorderIcon sx={{ color: '#EA580C', fontSize: 20 }} />} count={bookmarkedJobs.length} defaultOpen={bookmarkedJobs.length > 0}>
        {bookmarkedJobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>{t('activities.noBookmarks')}</Typography>
            <Button variant="outlined" size="small" onClick={() => navigate('/jobs')}>{t('activities.viewJobs')}</Button>
          </Box>
        ) : isMobile ? (
          <Box>
            {bookmarkedJobs.map((job) => (
              <Box key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                sx={{ p: 2, mb: 1, borderRadius: '8px', border: '1px solid #F3F4F6', cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{job.company}</Typography>
                    <Typography variant="body2" fontWeight={600}>{job.title_ko || job.position}</Typography>
                  </Box>
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); setBookmarkedJobs((prev) => prev.filter((j) => j.id !== job.id)); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">{job.location}</Typography>
                  <Chip label={job.type || job.employment_type} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>회사</TableCell>
                  <TableCell>직무</TableCell>
                  <TableCell align="center">근무지</TableCell>
                  <TableCell align="center">유형</TableCell>
                  <TableCell align="center" width={50}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookmarkedJobs.map((job) => (
                  <TableRow key={job.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>
                    <TableCell><Typography variant="body2" fontWeight={500}>{job.company}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{job.title_ko || job.position}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2" color="text.secondary">{job.location}</Typography></TableCell>
                    <TableCell align="center"><Chip label={job.type || job.employment_type} size="small" sx={{ height: 22, fontSize: '0.7rem' }} /></TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); setBookmarkedJobs((prev) => prev.filter((j) => j.id !== job.id)); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Section>

      {/* ── Consultation Detail Dialog ── */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>{t('activities.consultationDetail')}</Typography>
          <IconButton size="small" onClick={() => setDetailOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedConsultation && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">상담사</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#0047BA' }}>
                      {(selectedConsultation.consultant || '')?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500}>{selectedConsultation.consultant}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">날짜/시간</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>{selectedConsultation.date}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">상담 방법</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip size="small" icon={methodIcon[selectedConsultation.method]} label={selectedConsultation.method} sx={{ height: 24 }} />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">상태</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {(() => {
                      const sc = statusColors[selectedConsultation.status];
                      return <Chip size="small" label={selectedConsultation.status} sx={{ height: 24, fontWeight: 600, bgcolor: sc?.bg, color: sc?.color }} />;
                    })()}
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                메모 ({selectedConsultation.records?.length || 0})
              </Typography>
              {selectedConsultation.records?.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  {selectedConsultation.records.map((r) => (
                    <Paper key={r.id} elevation={0} sx={{ p: 2, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {r.record_type === 'file' ? <FileIcon sx={{ fontSize: 14, color: '#DC2626' }} /> : <TextIcon sx={{ fontSize: 14, color: '#0047BA' }} />}
                          <Typography variant="caption" fontWeight={600}>{r.author_name || '작성자'}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{r.created_at}</Typography>
                      </Box>
                      {r.content && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{r.content}</Typography>}
                      {r.file_name && <Chip size="small" icon={<FileIcon sx={{ fontSize: '14px !important' }} />} label={r.file_name} sx={{ mt: 1, height: 24, fontSize: '0.7rem', bgcolor: alpha('#DC2626', 0.06) }} />}
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#F8F9FA', borderRadius: '8px', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">메모가 없습니다</Typography>
                </Paper>
              )}

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>메모 추가</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" multiline rows={2} placeholder="메모를 입력하세요..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                <Button variant="contained" size="small" onClick={handleAddNote} disabled={!newNote.trim()} sx={{ alignSelf: 'flex-end', minWidth: 60 }}>추가</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setDetailOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* ── Cancel Confirmation ── */}
      <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)}>
        <DialogTitle>상담 취소</DialogTitle>
        <DialogContent>
          <Typography>{cancelTarget?.date} 상담을 취소하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>아니요</Button>
          <Button variant="contained" color="error" onClick={() => handleCancel(cancelTarget)}>취소 확정</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyActivities;
