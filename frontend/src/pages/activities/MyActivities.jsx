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
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  EventNote as EventIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { programsAPI, consultationsAPI, coursesAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const MyActivities = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine initial tab from URL path
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch based on current tab
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

  // Mock data
  const mockApplications = [
    { id: 1, date: '2024.05.20', title: '[시니어] 은퇴 자금 설계', category: '재무', status: '승인대기' },
    { id: 2, date: '2024.05.15', title: '건강한 노후를 위한 식단 관리', category: '건강', status: '승인완료' },
    { id: 3, date: '2024.05.10', title: '디지털 시대의 금융 생활 가이드', category: '디지털', status: '진행중' },
    { id: 4, date: '2024.05.05', title: '부동산 임대 사업 A to Z', category: '부동산', status: '승인완료' },
    { id: 5, date: '2024.05.01', title: '[특강] 은퇴 후 취미 생활 찾기', category: '여가', status: '승인완료' },
  ];

  const mockConsultations = [
    { id: 1, date: '2024.05.25 14:00', consultant: '김상담 컨설턴트', topic: '노후 재무 플랜 상담', status: '예약됨' },
    { id: 2, date: '2024.05.18 10:00', consultant: '이경력 컨설턴트', topic: '재취업 방향성 상담', status: '완료' },
    { id: 3, date: '2024.05.10 15:00', consultant: '박진로 컨설턴트', topic: '자산 관리 전략', status: '완료' },
  ];

  const mockCourses = [
    { id: 1, title: '은퇴 후 스마트한 자산 관리', progress: 60, status: '진행중' },
    { id: 2, title: '성공적인 부동산 투자 전략', progress: 50, status: '진행중' },
    { id: 3, title: '시니어 금융 활용 가이드', progress: 100, status: '완료' },
  ];

  const displayApplications = applications.length > 0 ? applications : mockApplications;
  const displayConsultations = consultations.length > 0 ? consultations : mockConsultations;
  const displayCourses = courses.length > 0 ? courses : mockCourses;

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
              {/* Tabs */}
              <Tabs
                value={tab}
                onChange={handleTabChange}
                sx={{ mb: 3, borderBottom: '1px solid #E5E5E5' }}
              >
                <Tab label={t('activities.applicationHistory')} />
                <Tab label={t('activities.consultationRecords')} />
                <Tab label={t('activities.courseStatus')} />
              </Tabs>

              {/* Tab Content */}
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
                  )}

                  {/* Consultation Records */}
                  {tab === 1 && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('activities.consultationDate')}</TableCell>
                            <TableCell>{t('activities.consultant')}</TableCell>
                            <TableCell>{t('activities.summary')}</TableCell>
                            <TableCell align="center">{t('programs.status')}</TableCell>
                            <TableCell align="center"></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayConsultations.map((consultation) => (
                            <TableRow key={consultation.id} hover>
                              <TableCell>{consultation.date || consultation.scheduled_at}</TableCell>
                              <TableCell>{consultation.consultant || consultation.consultant_name}</TableCell>
                              <TableCell>{consultation.topic}</TableCell>
                              <TableCell align="center">
                                <StatusBadge status={consultation.status} />
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
                  )}

                  {/* Course Status */}
                  {tab === 2 && (
                    <Box>
                      {displayCourses.map((course) => (
                        <Box
                          key={course.id}
                          sx={{
                            p: 2,
                            mb: 2,
                            border: '1px solid #E5E5E5',
                            borderRadius: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {course.title || course.course?.title_ko}
                            </Typography>
                            <StatusBadge status={course.status || (course.progress === 100 ? '완료' : '진행중')} />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={course.progress || course.progress_percent || 0}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="body2" fontWeight={500}>
                              {course.progress || course.progress_percent || 0}%
                            </Typography>
                            <Button size="small" variant="outlined">
                              {course.progress === 100 ? '수료증' : '계속 학습'}
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={3}>
          {/* Activity Summary */}
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
                  <Typography variant="subtitle1" fontWeight={700}>
                    {stats.totalApplications}건
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="action" fontSize="small" />
                    <Typography variant="body2">{t('activities.inProgress')}</Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {stats.inProgress}건
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="action" fontSize="small" />
                    <Typography variant="body2">{t('activities.completed')}</Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {stats.completed}건
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Next Schedule */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {t('activities.nextSchedule')}
              </Typography>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#F8F9FA',
                  borderRadius: 1,
                  borderLeft: '3px solid #0047BA',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  2024.05.25 14:00
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  [상담] 노후 재무 플랜 상담
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyActivities;
