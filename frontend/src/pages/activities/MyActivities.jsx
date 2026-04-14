import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  LinearProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Avatar,
  IconButton,
  TextField,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Assignment as AssignmentIcon,
  EventNote as EventIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Videocam as OnlineIcon,
  LocationOn as OfflineIcon,
  Phone as PhoneIcon,
  Description as FileIcon,
  TextSnippet as TextIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon,
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

const MyActivities = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const getInitialTab = () => {
    if (location.pathname.includes('consultations')) return 1;
    if (location.pathname.includes('courses')) return 2;
    if (location.pathname.includes('bookmarks')) return 3;
    return 0;
  };

  const [tab, setTab] = useState(getInitialTab());
  const [loading, setLoading] = useState(true);

  // Sync tab when URL changes (e.g. from sidebar navigation)
  useEffect(() => {
    setTab(getInitialTab());
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  const [applications, setApplications] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Always load applications for the sidebar stats, regardless of active tab
  useEffect(() => {
    const loadStats = async () => {
      const allApps = await loadApplications();
      const myApps = user ? allApps.filter((a) => a.email === user.email) : allApps;
      setApplications(myApps);
    };
    loadStats();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 0) {
          // Read from Supabase store, filtered by current user
          const allApps = await loadApplications();
          const myApps = user ? allApps.filter((a) => a.email === user.email) : allApps;
          setApplications(myApps);
        } else if (tab === 1) {
          // Read from shared localStorage store
          const myBookings = user ? await getBookingsForUser(user.id) : [];
          const statusMap = { pending: '배정대기', pending_approval: '배정대기', proposed: '예약완료', confirmed: '예약완료', completed: '완료', rejected: '취소', cancelled: '취소' };
          const mapped = myBookings.map((b) => ({
            id: b.id,
            rawStatus: b.status,
            date: `${b.date} ${b.time}`,
            scheduled_at: `${b.date} ${b.time}`,
            consultant: b.consultantName || '배정 대기',
            consultant_name: b.consultantName || '배정 대기',
            topic: b.method,
            method: b.method,
            status: statusMap[b.status] || b.status,
            rejectReason: b.rejectReason || '',
            records: [],
          }));
          setConsultations(mapped);
        } else if (tab === 2) {
          setCourses(await getInProgressCourses());
        } else if (tab === 3) {
          // Load bookmarked jobs from shared store
          setBookmarkedJobs(await getBookmarkedJobs());
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab, user]);

  const displayApplications = applications;
  const displayConsultations = consultations;
  const displayCourses = courses;

  const activeApplications = displayApplications.filter((a) => a.status !== '취소');
  const stats = {
    totalApplications: activeApplications.length,
    inProgress: activeApplications.filter((a) => a.status === '진행중').length,
    completed: activeApplications.filter((a) => a.status === '승인완료' || a.status === '완료').length,
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    const paths = ['/activities/applications', '/activities/consultations', '/activities/courses', '/activities/bookmarks'];
    navigate(paths[newValue]);
  };

  const handleViewDetail = (consultation) => {
    setSelectedConsultation(consultation);
    setDetailOpen(true);
    setNewNote('');
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedConsultation) return;
    try {
      await consultationsAPI.addRecord(selectedConsultation.id, {
        record_type: 'text',
        content: newNote,
      });
    } catch {
      // demo mode - add locally
    }
    const newRecord = {
      id: `new-${Date.now()}`,
      record_type: 'text',
      content: newNote,
      author_name: user?.name_ko || '나',
      created_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setSelectedConsultation((prev) => ({
      ...prev,
      records: [...(prev.records || []), newRecord],
    }));
    setNewNote('');
  };

  const handleCancel = async (consultation) => {
    try {
      await consultationsAPI.cancel(consultation.id);
    } catch {
      // API may fail for demo data — try Supabase directly
      try {
        const { supabase } = require('../../utils/supabase');
        await supabase.from('consultation_bookings').update({ status: 'cancelled' }).eq('id', consultation.id);
      } catch { /* ignore */ }
    }
    // Update locally
    const updated = consultations.map((c) =>
      c.id === consultation.id ? { ...c, status: '취소' } : c
    );
    setConsultations(updated);
    setCancelConfirmOpen(false);
    setCancelTarget(null);
  };

  // Next scheduled consultation
  const nextConsultation = displayConsultations.find((c) => c.status === '예약완료');

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          {t('activities.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('activities.welcome', { name: (i18n.language === 'en' ? user?.name_en : user?.name_ko) || user?.name_ko || '회원' })}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={9}>
          <Card>
            <CardContent>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                sx={{ mb: 3, borderBottom: '1px solid #E5E5E5' }}
              >
                <Tab label={t('activities.applicationHistory')} />
                <Tab label={t('activities.consultationRecords')} />
                <Tab label={t('activities.courseStatus')} />
                <Tab label={t('activities.bookmarks')} icon={<BookmarkIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
              </Tabs>

              {loading ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : (
                <>
                  {/* Application History */}
                  {tab === 0 && (
                    displayApplications.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">{t('activities.noApplications')}</Typography>
                      </Box>
                    ) : isMobile ? (
                      <Box>
                        {displayApplications.map((app) => (
                          <Box key={app.id} sx={{ p: 2, mb: 1.5, borderRadius: '10px', border: '1px solid #E5E7EB', borderLeft: '4px solid #0047BA' }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>{app.program_title || app.title || app.program?.title_ko}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <CategoryBadge category={app.category || app.program?.category} />
                              <StatusBadge status={app.status} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">{t('activities.applicationDate')}: {app.date || app.applied_at}</Typography>
                            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                              <Button size="small" variant="outlined" onClick={() => navigate(`/programs/${app.program_id || app.programId}`)}>
                                {t('common.viewDetail')}
                              </Button>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('activities.applicationDate')}</TableCell>
                            <TableCell>{t('programs.programName')}</TableCell>
                            <TableCell align="center">{t('programs.category')}</TableCell>
                            <TableCell align="center">{t('programs.status')}</TableCell>
                            <TableCell align="center"></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayApplications.map((app) => (
                            <TableRow key={app.id} hover>
                              <TableCell>{app.date || app.applied_at}</TableCell>
                              <TableCell>{app.program_title || app.title || app.program?.title_ko}</TableCell>
                              <TableCell align="center">
                                <CategoryBadge category={app.category || app.program?.category} />
                              </TableCell>
                              <TableCell align="center">
                                <StatusBadge status={app.status} />
                              </TableCell>
                              <TableCell align="center">
                                <Button size="small" variant="outlined" onClick={() => navigate(`/programs/${app.program_id || app.programId}`)}>
                                  {t('common.viewDetail')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    )
                  )}

                  {/* Consultation Records */}
                  {tab === 1 && (
                    <Box>
                      {displayConsultations.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary" sx={{ mb: 2 }}>{t('activities.noConsultations')}</Typography>
                          <Button variant="outlined" onClick={() => navigate('/consultations/booking')}>
                            {t('activities.firstBooking')}
                          </Button>
                        </Box>
                      ) : isMobile ? (
                      /* ── Mobile Card Layout ── */
                      <Box>
                        {displayConsultations.map((c) => {
                          const sc = statusColors[c.status];
                          return (
                            <Box key={c.id} sx={{ p: 2, mb: 1.5, borderRadius: '10px', border: '1px solid #E5E7EB', borderLeft: `4px solid ${sc?.color || '#999'}`, bgcolor: '#fff' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600}>{c.date || c.scheduled_at}</Typography>
                                <Chip size="small" label={c.status} sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: sc?.bg || '#F3F4F6', color: sc?.color || '#374151' }} />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" color="text.secondary">{c.consultant || c.consultant_name}</Typography>
                                {c.method && <Chip size="small" icon={methodIcon[c.method]} label={c.method} sx={{ height: 22, fontSize: '0.7rem' }} />}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end', mt: 1, pt: 1, borderTop: '1px solid #F3F4F6' }}>
                                <Button size="small" variant="outlined" onClick={() => handleViewDetail(c)}>{t('common.viewDetail')}</Button>
                                {c.status === '배정대기' && (
                                  <Button size="small" variant="outlined" color="error" onClick={() => { setCancelTarget(c); setCancelConfirmOpen(true); }}>{t('common.cancel')}</Button>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                      ) : (
                      /* ── Desktop Table Layout ── */
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>{t('activities.dateTime')}</TableCell>
                              <TableCell>{t('activities.consultant')}</TableCell>
                              <TableCell>{t('activities.topic')}</TableCell>
                              <TableCell align="center">{t('activities.method')}</TableCell>
                              <TableCell align="center">{t('programs.status')}</TableCell>
                              <TableCell align="center"></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {displayConsultations.map((c) => {
                              const sc = statusColors[c.status];
                              return (
                                <React.Fragment key={c.id}>
                                <TableRow hover>
                                  <TableCell sx={{ fontSize: '0.875rem' }}>{c.date || c.scheduled_at}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem' }}>{c.consultant || c.consultant_name}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem' }}>{c.topic}</TableCell>
                                  <TableCell align="center">
                                    {c.method && <Chip size="small" icon={methodIcon[c.method]} label={c.method} sx={{ height: 24, fontSize: '0.75rem' }} />}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip size="small" label={c.status} sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: sc?.bg || '#F3F4F6', color: sc?.color || '#374151' }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                      <Button size="small" variant="outlined" onClick={() => handleViewDetail(c)}>{t('common.viewDetail')}</Button>
                                      {c.status === '배정대기' && (
                                        <Button size="small" variant="outlined" color="error" onClick={() => { setCancelTarget(c); setCancelConfirmOpen(true); }}>{t('common.cancel')}</Button>
                                      )}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                                </React.Fragment>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      )}
                    </Box>
                  )}

                  {/* Course Status */}
                  {tab === 2 && (
                    <Box>
                      {displayCourses.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">{t('activities.noCourses')}</Typography>
                        </Box>
                      ) : displayCourses.map((course) => {
                        const progress = course.progress || course.progress_percent || 0;
                        const isComplete = progress === 100;
                        return (
                          <Box
                            key={course.id}
                            onClick={() => navigate(`/learning/${course.course_id || course.id}`)}
                            sx={{
                              p: 2, mb: 2, borderRadius: '10px', cursor: 'pointer',
                              border: '1px solid',
                              borderColor: isComplete ? '#0047BA' : '#E5E5E5',
                              bgcolor: isComplete ? '#0047BA' : '#fff',
                              color: isComplete ? '#fff' : 'inherit',
                              opacity: isComplete ? 1 : 0.7,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                opacity: 1,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                borderColor: isComplete ? '#003399' : '#C5D1E0',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={500}>
                                {course.title || course.course?.title_ko}
                              </Typography>
                              <Chip
                                label={isComplete ? t('activities.participationComplete') : t('activities.statusInProgress')}
                                size="small"
                                sx={{
                                  fontWeight: 600, fontSize: '0.75rem',
                                  bgcolor: isComplete ? 'rgba(255,255,255,0.2)' : '#DBEAFE',
                                  color: isComplete ? '#fff' : '#1E40AF',
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  sx={{
                                    height: 8, borderRadius: 4,
                                    bgcolor: isComplete ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: isComplete ? '#fff' : '#0047BA',
                                      borderRadius: 4,
                                    },
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" fontWeight={600} sx={{ color: isComplete ? '#fff' : 'text.primary' }}>
                                {progress}%
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {/* Bookmarks */}
                  {tab === 3 && (
                    <Box>
                      {bookmarkedJobs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <BookmarkBorderIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
                          <Typography color="text.secondary" sx={{ mb: 1 }}>{t('activities.noBookmarks')}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {t('activities.bookmarkHint')}
                          </Typography>
                          <Button variant="outlined" onClick={() => navigate('/jobs')}>
                            {t('activities.viewJobs')}
                          </Button>
                        </Box>
                      ) : isMobile ? (
                          <Box>
                            {bookmarkedJobs.map((job) => (
                              <Box key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                                sx={{ p: 2, mb: 1.5, borderRadius: '10px', border: '1px solid #E5E7EB', cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">{job.company}</Typography>
                                    <Typography variant="subtitle2" fontWeight={600}>{job.title_ko || job.position}</Typography>
                                  </Box>
                                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); setBookmarkedJobs((prev) => prev.filter((j) => j.id !== job.id)); }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                  <Typography variant="caption" color="text.secondary">{job.location}</Typography>
                                  <Chip label={job.type || job.employment_type} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>{t('activities.company')}</TableCell>
                                <TableCell>{t('activities.position')}</TableCell>
                                <TableCell align="center">{t('activities.workplace')}</TableCell>
                                <TableCell align="center">{t('activities.employmentType')}</TableCell>
                                <TableCell align="center"></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {bookmarkedJobs.map((job) => (
                                <TableRow key={job.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>
                                  <TableCell><Typography variant="body2" fontWeight={500}>{job.company}</Typography></TableCell>
                                  <TableCell><Typography variant="body2">{job.title_ko || job.position}</Typography></TableCell>
                                  <TableCell align="center"><Typography variant="body2" color="text.secondary">{job.location}</Typography></TableCell>
                                  <TableCell align="center"><Chip label={job.type || job.employment_type} size="small" sx={{ height: 24, fontSize: '0.75rem' }} /></TableCell>
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
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={3}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {t('activities.activitySummary')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon color="action" fontSize="small" />
                    <Typography variant="body2">{t('activities.totalApplications')}</Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>{stats.totalApplications}건</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="action" fontSize="small" />
                    <Typography variant="body2">{t('activities.inProgress')}</Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>{stats.inProgress}건</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="action" fontSize="small" />
                    <Typography variant="body2">{t('activities.completed')}</Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>{stats.completed}건</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {t('activities.nextSchedule')}
              </Typography>
              {nextConsultation ? (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#F8F9FA',
                    borderRadius: 1,
                    borderLeft: '3px solid #0047BA',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewDetail(nextConsultation)}
                >
                  <Typography variant="caption" color="text.secondary">
                    {nextConsultation.date || nextConsultation.scheduled_at}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    [상담] {nextConsultation.topic}
                  </Typography>
                  <Chip
                    size="small"
                    icon={methodIcon[nextConsultation.method]}
                    label={`${nextConsultation.method} | ${nextConsultation.consultant || nextConsultation.consultant_name}`}
                    sx={{ mt: 1, height: 22, fontSize: '0.7rem' }}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 2, backgroundColor: '#F8F9FA', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('activities.noScheduled')}
                  </Typography>
                  <Button size="small" variant="contained" onClick={() => navigate('/consultations/booking')}>
                    {t('activities.bookConsultation')}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Consultation Detail Dialog ──────────────────────────────────── */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>{t('activities.consultationDetail')}</Typography>
          <IconButton size="small" onClick={() => setDetailOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedConsultation && (
            <Box>
              {/* Info Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">{t('activities.consultant')}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#0047BA' }}>
                      {(selectedConsultation.consultant || selectedConsultation.consultant_name || '')?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedConsultation.consultant || selectedConsultation.consultant_name}
                      </Typography>
                      {selectedConsultation.consultant_department && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {selectedConsultation.consultant_department}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">{t('activities.dateTime')}</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                    {selectedConsultation.date || selectedConsultation.scheduled_at}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">{t('activities.consultationMethod')}</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      icon={methodIcon[selectedConsultation.method]}
                      label={selectedConsultation.method}
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">{t('programs.status')}</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {(() => {
                      const sc = statusColors[selectedConsultation.status];
                      return (
                        <Chip
                          size="small"
                          label={selectedConsultation.status}
                          sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: sc?.bg, color: sc?.color }}
                        />
                      );
                    })()}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">{t('activities.topic')}</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                    {selectedConsultation.topic}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Records */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                {t('activities.consultationRecordCount', { count: selectedConsultation.records?.length || 0 })}
              </Typography>

              {selectedConsultation.records?.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  {selectedConsultation.records.map((record) => (
                    <Paper key={record.id} elevation={0} sx={{ p: 2, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {record.record_type === 'file' ? <FileIcon sx={{ fontSize: 16, color: '#DC2626' }} /> : <TextIcon sx={{ fontSize: 16, color: '#0047BA' }} />}
                          <Typography variant="caption" fontWeight={600}>
                            {record.author_name || '작성자'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {record.created_at}
                        </Typography>
                      </Box>
                      {record.content && (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                          {record.content}
                        </Typography>
                      )}
                      {record.file_name && (
                        <Chip
                          size="small"
                          icon={<FileIcon sx={{ fontSize: '14px !important' }} />}
                          label={record.file_name}
                          sx={{ mt: 1, height: 26, fontSize: '0.75rem', cursor: 'pointer', bgcolor: alpha('#DC2626', 0.06) }}
                        />
                      )}
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#F8F9FA', borderRadius: '8px', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">{t('activities.noRecords')}</Typography>
                </Paper>
              )}

              {/* Add Note */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{t('activities.addNote')}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder={t('activities.notePlaceholder')}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  sx={{ alignSelf: 'flex-end', minWidth: 72 }}
                >
                  {t('activities.add')}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setDetailOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Cancel Confirmation Dialog ──────────────────────────────────── */}
      <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)}>
        <DialogTitle>{t('activities.cancelConsultation')}</DialogTitle>
        <DialogContent>
          <Typography>
            {cancelTarget?.date || cancelTarget?.scheduled_at} - "{cancelTarget?.topic}" {t('activities.cancelConfirm')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>{t('activities.no')}</Button>
          <Button variant="contained" color="error" onClick={() => handleCancel(cancelTarget)}>
            {t('activities.confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyActivities;
