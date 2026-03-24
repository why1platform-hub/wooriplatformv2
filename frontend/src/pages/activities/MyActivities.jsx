import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { programsAPI, consultationsAPI, coursesAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const methodIcon = {
  '온라인': <OnlineIcon sx={{ fontSize: 14 }} />,
  '오프라인': <OfflineIcon sx={{ fontSize: 14 }} />,
  '전화': <PhoneIcon sx={{ fontSize: 14 }} />,
};

const statusColors = {
  '예약됨': { color: '#1E40AF', bg: '#DBEAFE' },
  '완료': { color: '#166534', bg: '#DCFCE7' },
  '취소': { color: '#991B1B', bg: '#FEE2E2' },
  '노쇼': { color: '#92400E', bg: '#FEF3C7' },
};

const MyActivities = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getInitialTab = () => {
    if (location.pathname.includes('consultations')) return 1;
    if (location.pathname.includes('courses')) return 2;
    return 0;
  };

  const [tab, setTab] = useState(getInitialTab());
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [courses, setCourses] = useState([]);

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 0) {
          const response = await programsAPI.getAll({ mine: true });
          setApplications(response.data.applications || []);
        } else if (tab === 1) {
          const response = await consultationsAPI.getMine();
          setConsultations(response.data.consultations || []);
        } else {
          const response = await coursesAPI.getEnrollments();
          setCourses(response.data.enrollments || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab]);

  const displayApplications = applications;
  const displayConsultations = consultations;
  const displayCourses = courses;

  const stats = {
    totalApplications: displayApplications.length,
    inProgress: displayApplications.filter((a) => a.status === '진행중').length,
    completed: displayApplications.filter((a) => a.status === '승인완료' || a.status === '완료').length,
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    const paths = ['/activities/applications', '/activities/consultations', '/activities/courses'];
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
      // API may fail for demo data
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
  const nextConsultation = displayConsultations.find((c) => c.status === '예약됨');

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          {t('activities.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('activities.welcome', { name: user?.name_ko || user?.name_en || '회원' })}
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
                        <Typography color="text.secondary">신청 내역이 없습니다.</Typography>
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
                              <TableCell>{app.title || app.program?.title_ko}</TableCell>
                              <TableCell align="center">
                                <CategoryBadge category={app.category || app.program?.category} />
                              </TableCell>
                              <TableCell align="center">
                                <StatusBadge status={app.status} />
                              </TableCell>
                              <TableCell align="center">
                                <Button size="small" variant="outlined">
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
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate('/consultations/booking')}
                        >
                          상담 예약하기
                        </Button>
                      </Box>
                      {displayConsultations.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary" sx={{ mb: 2 }}>상담 내역이 없습니다.</Typography>
                          <Button variant="outlined" onClick={() => navigate('/consultations/booking')}>
                            첫 상담 예약하기
                          </Button>
                        </Box>
                      ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>날짜/시간</TableCell>
                              <TableCell>상담사</TableCell>
                              <TableCell>주제</TableCell>
                              <TableCell align="center">방법</TableCell>
                              <TableCell align="center">기록</TableCell>
                              <TableCell align="center">상태</TableCell>
                              <TableCell align="center"></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {displayConsultations.map((c) => {
                              const sc = statusColors[c.status];
                              return (
                                <TableRow key={c.id} hover>
                                  <TableCell sx={{ fontSize: '0.875rem' }}>{c.date || c.scheduled_at}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem' }}>{c.consultant || c.consultant_name}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem' }}>{c.topic}</TableCell>
                                  <TableCell align="center">
                                    {c.method && (
                                      <Chip
                                        size="small"
                                        icon={methodIcon[c.method]}
                                        label={c.method}
                                        sx={{ height: 24, fontSize: '0.75rem' }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography variant="body2">
                                      {(c.records?.length || c.records_count || 0) > 0
                                        ? `${c.records?.length || c.records_count}건`
                                        : '-'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      size="small"
                                      label={c.status}
                                      sx={{
                                        height: 24,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        bgcolor: sc?.bg || '#F3F4F6',
                                        color: sc?.color || '#374151',
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                      <Button size="small" variant="outlined" onClick={() => handleViewDetail(c)}>
                                        상세보기
                                      </Button>
                                      {c.status === '예약됨' && (
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          color="error"
                                          onClick={() => { setCancelTarget(c); setCancelConfirmOpen(true); }}
                                        >
                                          취소
                                        </Button>
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
                    </Box>
                  )}

                  {/* Course Status */}
                  {tab === 2 && (
                    <Box>
                      {displayCourses.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">수강 중인 강의가 없습니다.</Typography>
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
                                label={isComplete ? '참여완료' : '진행중'}
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
                    예정된 상담이 없습니다
                  </Typography>
                  <Button size="small" variant="contained" onClick={() => navigate('/consultations/booking')}>
                    상담 예약하기
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
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>상담 상세</Typography>
          <IconButton size="small" onClick={() => setDetailOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedConsultation && (
            <Box>
              {/* Info Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">상담사</Typography>
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
                  <Typography variant="caption" color="text.secondary">날짜/시간</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                    {selectedConsultation.date || selectedConsultation.scheduled_at}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">상담 방법</Typography>
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
                  <Typography variant="caption" color="text.secondary">상태</Typography>
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
                  <Typography variant="caption" color="text.secondary">주제</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                    {selectedConsultation.topic}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Records */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                상담 기록 ({selectedConsultation.records?.length || 0}건)
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
                  <Typography variant="body2" color="text.secondary">아직 기록이 없습니다.</Typography>
                </Paper>
              )}

              {/* Add Note */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>메모 추가</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="상담 메모를 입력하세요..."
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
                  추가
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setDetailOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Cancel Confirmation Dialog ──────────────────────────────────── */}
      <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)}>
        <DialogTitle>상담 취소</DialogTitle>
        <DialogContent>
          <Typography>
            {cancelTarget?.date || cancelTarget?.scheduled_at} - "{cancelTarget?.topic}" 상담을 취소하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>아니오</Button>
          <Button variant="contained" color="error" onClick={() => handleCancel(cancelTarget)}>
            취소하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyActivities;
