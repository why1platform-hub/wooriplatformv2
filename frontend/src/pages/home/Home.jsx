import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Chat as ChatIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  MenuBook as MenuBookIcon,
  Support as SupportIcon,
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

// Announcement List Component
const AnnouncementList = ({ announcements, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  // Mock data if no announcements
  const items = announcements?.length > 0 ? announcements : [
    { id: 1, title: '2024년 하반기 퇴직자 교육 일정 변경 안내', type: '긴급', date: '2024.05.10' },
    { id: 2, title: '5월 퇴직자 네트워킹 프로그램 참여 신청 마감', type: '안내', date: '2024.05.08' },
    { id: 3, title: '맞춤형 재취업 컨설팅 신규 과정 개설', type: '안내', date: '2024.05.05' },
  ];

  return (
    <Box>
      {items.map((item) => (
        <Box
          key={item.id}
          onClick={() => navigate(`/announcements/${item.id}`)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            mb: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#F8F9FA',
            },
          }}
        >
          <Chip
            label={item.type}
            size="small"
            sx={{
              backgroundColor: item.type === '긴급' ? '#FEE2E2' : '#DBEAFE',
              color: item.type === '긴급' ? '#991B1B' : '#1E40AF',
              fontWeight: 500,
              minWidth: 48,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.date}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// Ongoing Programs Component
const OngoingPrograms = ({ programs, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2].map((i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  // Mock data
  const items = programs?.length > 0 ? programs : [
    {
      id: 1,
      title: '은퇴 후 자산관리 심화 과정',
      category: '금융컨설팅',
      period: '2024.05.01 ~ 2024.05.31',
      deadline: '2024.05.31',
      dDay: 10,
      status: '진행중',
    },
    {
      id: 2,
      title: '퇴직 임원 리더십 코칭',
      category: '창업',
      period: '2024.05.15 ~ 2024.06.15',
      deadline: '2024.06.15',
      dDay: 24,
      status: '접수중',
    },
  ];

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Grid container spacing={2}>
      {items.map((program) => (
        <Grid item xs={12} sm={6} key={program.id}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
            onClick={() => navigate(`/programs/${program.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <CategoryBadge category={program.category} />
                <StatusBadge status={program.status} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                {program.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {program.period}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="primary"
                >
                  D-{program.dDay || getDaysRemaining(program.deadline)}
                </Typography>
                <Button variant="outlined" size="small">
                  {program.status === '진행중' ? '학습하기' : '상세보기'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// My Status Component
const MyStatus = ({ stats, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" width={80} height={60} sx={{ borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  const items = [
    { icon: <AssignmentIcon />, label: t('home.appliedPrograms'), value: stats?.appliedPrograms || 2 },
    { icon: <ChatIcon />, label: t('home.scheduledConsultations'), value: stats?.scheduledConsultations || 1 },
    { icon: <SchoolIcon />, label: t('home.ongoingCourses'), value: stats?.ongoingCourses || 1 },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {items.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {item.value}건
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// Calendar Widget Component
const CalendarWidget = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Mock events
  const mockEvents = [
    { date: 6, color: '#0047BA' },
    { date: 14, color: '#DC2626' },
    { date: 15, color: '#0047BA' },
    { date: 20, color: '#059669' },
    { date: 21, color: '#0047BA' },
    { date: 27, color: '#7C3AED' },
    { date: 28, color: '#0047BA' },
  ];

  const hasEvent = (day) => mockEvents.find((e) => e.date === day);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton size="small" onClick={prevMonth}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={600}>
          {year}년 {month + 1}월
        </Typography>
        <IconButton size="small" onClick={nextMonth}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {weekDays.map((day) => (
          <Typography
            key={day}
            variant="caption"
            sx={{
              textAlign: 'center',
              py: 0.5,
              color: day === '일' ? '#DC2626' : day === '토' ? '#0047BA' : 'text.secondary',
              fontWeight: 500,
            }}
          >
            {day}
          </Typography>
        ))}
        {days.map((day, index) => {
          const event = hasEvent(day);
          return (
            <Box
              key={index}
              sx={{
                position: 'relative',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: isToday(day) ? '#0047BA' : 'transparent',
                color: isToday(day) ? '#FFFFFF' : 'inherit',
                cursor: day ? 'pointer' : 'default',
                '&:hover': day ? { backgroundColor: isToday(day) ? '#003399' : '#F3F4F6' } : {},
              }}
            >
              <Typography variant="caption" fontWeight={isToday(day) ? 600 : 400}>
                {day}
              </Typography>
              {event && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 2,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: event.color,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Event Legend */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E5E5' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          이번 달 일정
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0047BA' }} />
            <Typography variant="caption">5월 퇴직자 네트워킹 프로그램</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#DC2626' }} />
            <Typography variant="caption">퇴직 임원 리더십 코칭</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669' }} />
            <Typography variant="caption">맞춤형 재취업 컨설팅 과정</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Job Recommendations Component
const JobRecommendations = ({ jobs, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box>
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  // Mock data
  const items = jobs?.length > 0 ? jobs : [
    { id: 1, company: '(주)한화생명', position: '시니어 금융 전문 컨설턴트', location: '서울 중구' },
    { id: 2, company: 'KB국민은행', position: '디지털 금융 플랫폼 기획자', location: '서울 여의도' },
  ];

  return (
    <Box>
      {items.map((job) => (
        <Box
          key={job.id}
          onClick={() => navigate(`/jobs/${job.id}`)}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            p: 2,
            mb: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#F8F9FA',
            },
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              회사명 {job.company}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {job.position}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              지역 {job.location}
            </Typography>
          </Box>
          <IconButton size="small">
            <BookmarkIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

// Quick Access Component
const QuickAccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const items = [
    { icon: <AssignmentIcon />, label: '프로그램 신청', path: '/programs' },
    { icon: <WorkIcon />, label: '채용정보 보기', path: '/jobs' },
    { icon: <MenuBookIcon />, label: '학습자료실', path: '/learning' },
    { icon: <SupportIcon />, label: '고객지원', path: '/support' },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate(item.path)}
            sx={{
              py: 2,
              flexDirection: 'column',
              gap: 1,
              borderColor: '#E5E5E5',
              '&:hover': {
                borderColor: '#0047BA',
                backgroundColor: 'rgba(0, 71, 186, 0.04)',
              },
            }}
          >
            <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
            <Typography variant="body2" fontWeight={500}>
              {item.label}
            </Typography>
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

// Main Home Page
const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardAPI.getHome();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Column (60%) */}
        <Grid item xs={12} lg={7}>
          {/* Important Announcements */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} color="primary">
                  {t('home.announcements')}
                </Typography>
                <Button size="small" href="/announcements">
                  {t('common.viewMore')}
                </Button>
              </Box>
              <AnnouncementList announcements={dashboardData?.announcements} loading={loading} />
            </CardContent>
          </Card>

          {/* Ongoing Programs */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  {t('home.ongoingPrograms')}
                </Typography>
                <Button size="small" href="/programs">
                  {t('common.viewMore')}
                </Button>
              </Box>
              <OngoingPrograms programs={dashboardData?.programs} loading={loading} />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column (40%) */}
        <Grid item xs={12} lg={5}>
          {/* My Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {t('home.myStatus')}
              </Typography>
              <MyStatus stats={dashboardData?.stats} loading={loading} />
            </CardContent>
          </Card>

          {/* Monthly Calendar */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {t('home.monthlyCalendar')}
              </Typography>
              <CalendarWidget events={dashboardData?.events} />
            </CardContent>
          </Card>

          {/* Job Recommendations */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  {t('home.jobRecommendations')}
                </Typography>
                <Button size="small" href="/jobs">
                  {t('common.viewMore')}
                </Button>
              </Box>
              <JobRecommendations jobs={dashboardData?.jobs} loading={loading} />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Access */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {t('home.quickAccess')}
              </Typography>
              <QuickAccess />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
