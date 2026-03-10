import React, { useState, useEffect, useMemo } from 'react';
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
  Tooltip,
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
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { ResponsiveGridLayout as RGLResponsive, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

// Wrap ResponsiveGridLayout with container width measurement
const ResponsiveGridLayout = React.forwardRef(function WrappedRGL(props, ref) {
  const { containerRef, width } = useContainerWidth();
  return (
    <div ref={containerRef}>
      {width > 0 && <RGLResponsive {...props} ref={ref} width={width} />}
    </div>
  );
});

const LAYOUT_STORAGE_KEY = 'woori_dashboard_layout';

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'announcements', x: 0, y: 0, w: 7, h: 5, minW: 4, minH: 3 },
    { i: 'programs', x: 0, y: 5, w: 7, h: 5, minW: 4, minH: 3 },
    { i: 'myStatus', x: 7, y: 0, w: 5, h: 3, minW: 3, minH: 2 },
    { i: 'calendar', x: 7, y: 3, w: 5, h: 7, minW: 3, minH: 5 },
    { i: 'jobs', x: 7, y: 10, w: 5, h: 4, minW: 3, minH: 3 },
    { i: 'quickAccess', x: 0, y: 10, w: 12, h: 3, minW: 6, minH: 2 },
  ],
  md: [
    { i: 'announcements', x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 3 },
    { i: 'programs', x: 0, y: 5, w: 6, h: 5, minW: 4, minH: 3 },
    { i: 'myStatus', x: 6, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'calendar', x: 6, y: 3, w: 4, h: 7, minW: 3, minH: 5 },
    { i: 'jobs', x: 6, y: 10, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'quickAccess', x: 0, y: 10, w: 10, h: 3, minW: 6, minH: 2 },
  ],
  sm: [
    { i: 'announcements', x: 0, y: 0, w: 6, h: 5, minW: 3, minH: 3 },
    { i: 'myStatus', x: 0, y: 5, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'programs', x: 0, y: 8, w: 6, h: 5, minW: 3, minH: 3 },
    { i: 'calendar', x: 0, y: 13, w: 6, h: 7, minW: 3, minH: 5 },
    { i: 'jobs', x: 0, y: 20, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'quickAccess', x: 0, y: 24, w: 6, h: 3, minW: 3, minH: 2 },
  ],
};

// Announcement List Component
const AnnouncementList = ({ announcements, loading }) => {
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
            display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 1,
            backgroundColor: '#FFFFFF', borderRadius: 1, cursor: 'pointer',
            '&:hover': { backgroundColor: '#F8F9FA' },
          }}
        >
          <Chip label={item.type} size="small"
            sx={{
              backgroundColor: item.type === '긴급' ? '#FEE2E2' : '#DBEAFE',
              color: item.type === '긴급' ? '#991B1B' : '#1E40AF',
              fontWeight: 500, minWidth: 48,
            }}
          />
          <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">{item.date}</Typography>
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

  const items = programs?.length > 0 ? programs : [
    { id: 1, title: '은퇴 후 자산관리 심화 과정', category: '금융컨설팅', period: '2024.05.01 ~ 2024.05.31', deadline: '2024.05.31', dDay: 10, status: '진행중' },
    { id: 2, title: '퇴직 임원 리더십 코칭', category: '창업', period: '2024.05.15 ~ 2024.06.15', deadline: '2024.06.15', dDay: 24, status: '접수중' },
  ];

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const end = new Date(deadline);
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <Grid container spacing={2}>
      {items.map((program) => (
        <Grid item xs={12} sm={6} key={program.id}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}
            onClick={() => navigate(`/programs/${program.id}`)}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <CategoryBadge category={program.category} />
                <StatusBadge status={program.status} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{program.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{program.period}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary">
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
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>{item.value}건</Typography>
            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
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
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const today = new Date();
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const mockEvents = [
    { date: 6, color: '#0047BA' }, { date: 14, color: '#DC2626' },
    { date: 15, color: '#0047BA' }, { date: 20, color: '#059669' },
    { date: 21, color: '#0047BA' }, { date: 27, color: '#7C3AED' },
    { date: 28, color: '#0047BA' },
  ];
  const hasEvent = (day) => mockEvents.find((e) => e.date === day);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton size="small" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><ChevronLeft /></IconButton>
        <Typography variant="subtitle1" fontWeight={600}>{year}년 {month + 1}월</Typography>
        <IconButton size="small" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><ChevronRight /></IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {weekDays.map((day) => (
          <Typography key={day} variant="caption" sx={{
            textAlign: 'center', py: 0.5, fontWeight: 500,
            color: day === '일' ? '#DC2626' : day === '토' ? '#0047BA' : 'text.secondary',
          }}>
            {day}
          </Typography>
        ))}
        {days.map((day, index) => {
          const event = hasEvent(day);
          return (
            <Box key={index} sx={{
              position: 'relative', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', backgroundColor: isToday(day) ? '#0047BA' : 'transparent',
              color: isToday(day) ? '#FFFFFF' : 'inherit', cursor: day ? 'pointer' : 'default',
              '&:hover': day ? { backgroundColor: isToday(day) ? '#003399' : '#F3F4F6' } : {},
            }}>
              <Typography variant="caption" fontWeight={isToday(day) ? 600 : 400}>{day}</Typography>
              {event && (
                <Box sx={{ position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: '50%', backgroundColor: event.color }} />
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E5E5' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>이번 달 일정</Typography>
        {[
          { color: '#0047BA', text: '5월 퇴직자 네트워킹 프로그램' },
          { color: '#DC2626', text: '퇴직 임원 리더십 코칭' },
          { color: '#059669', text: '맞춤형 재취업 컨설팅 과정' },
        ].map((e, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: e.color }} />
            <Typography variant="caption">{e.text}</Typography>
          </Box>
        ))}
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

  const items = jobs?.length > 0 ? jobs : [
    { id: 1, company: '(주)한화생명', position: '시니어 금융 전문 컨설턴트', location: '서울 중구' },
    { id: 2, company: 'KB국민은행', position: '디지털 금융 플랫폼 기획자', location: '서울 여의도' },
  ];

  return (
    <Box>
      {items.map((job) => (
        <Box key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
          sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            p: 2, mb: 1, backgroundColor: '#FFFFFF', borderRadius: 1, cursor: 'pointer',
            '&:hover': { backgroundColor: '#F8F9FA' },
          }}>
          <Box>
            <Typography variant="caption" color="text.secondary">회사명 {job.company}</Typography>
            <Typography variant="body2" fontWeight={500}>{job.position}</Typography>
            <Typography variant="caption" color="text.secondary">지역 {job.location}</Typography>
          </Box>
          <IconButton size="small"><BookmarkIcon fontSize="small" /></IconButton>
        </Box>
      ))}
    </Box>
  );
};

// Quick Access Component
const QuickAccess = () => {
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
          <Button fullWidth variant="outlined" onClick={() => navigate(item.path)}
            sx={{
              py: 2, flexDirection: 'column', gap: 1, borderColor: '#E5E5E5',
              '&:hover': { borderColor: '#0047BA', backgroundColor: 'rgba(0,71,186,0.04)' },
            }}>
            <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
            <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

// Widget wrapper with title
const DashboardWidget = ({ title, children, action, noPadding }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <CardContent sx={{ flex: 1, overflow: 'auto', p: noPadding ? 0 : 2, '&:last-child': { pb: noPadding ? 0 : 2 } }}>
      {title && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: noPadding ? 2 : 0, pt: noPadding ? 2 : 0 }}>
          <Typography variant="h6" fontWeight={700} color={title.includes('공지') ? 'primary' : 'inherit'}>
            {title}
          </Typography>
          {action}
        </Box>
      )}
      <Box sx={{ px: noPadding ? 2 : 0, pb: noPadding ? 2 : 0 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

// Main Home Page
const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLocked, setIsLocked] = useState(true);

  // Load saved layouts
  const [layouts, setLayouts] = useState(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return DEFAULT_LAYOUTS;
  });

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

  const handleLayoutChange = (_, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
  };

  const handleResetLayout = () => {
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(DEFAULT_LAYOUTS));
  };

  const widgets = useMemo(() => ({
    announcements: (
      <DashboardWidget title={t('home.announcements')} action={<Button size="small" onClick={() => navigate('/announcements')}>{t('common.viewMore')}</Button>}>
        <AnnouncementList announcements={dashboardData?.announcements} loading={loading} />
      </DashboardWidget>
    ),
    programs: (
      <DashboardWidget title={t('home.ongoingPrograms')} action={<Button size="small" onClick={() => navigate('/programs')}>{t('common.viewMore')}</Button>}>
        <OngoingPrograms programs={dashboardData?.programs} loading={loading} />
      </DashboardWidget>
    ),
    myStatus: (
      <DashboardWidget title={t('home.myStatus')}>
        <MyStatus stats={dashboardData?.stats} loading={loading} />
      </DashboardWidget>
    ),
    calendar: (
      <DashboardWidget title={t('home.monthlyCalendar')}>
        <CalendarWidget events={dashboardData?.events} />
      </DashboardWidget>
    ),
    jobs: (
      <DashboardWidget title={t('home.jobRecommendations')} action={<Button size="small" onClick={() => navigate('/jobs')}>{t('common.viewMore')}</Button>}>
        <JobRecommendations jobs={dashboardData?.jobs} loading={loading} />
      </DashboardWidget>
    ),
    quickAccess: (
      <DashboardWidget title={t('home.quickAccess')}>
        <QuickAccess />
      </DashboardWidget>
    ),
  }), [dashboardData, loading, t, navigate]);

  return (
    <Box>
      {/* Layout controls */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 1 }}>
        {!isLocked && (
          <Button size="small" variant="text" onClick={handleResetLayout} sx={{ fontSize: '0.75rem' }}>
            레이아웃 초기화
          </Button>
        )}
        <Tooltip title={isLocked ? '레이아웃 편집' : '레이아웃 잠금'}>
          <IconButton size="small" onClick={() => setIsLocked(!isLocked)}
            sx={{ color: isLocked ? 'text.secondary' : 'primary.main' }}>
            {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <ResponsiveGridLayout
        className="dashboard-grid"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 1 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={!isLocked}
        isResizable={!isLocked}
        draggableHandle=".drag-handle"
        compactType="vertical"
        margin={[16, 16]}
      >
        {Object.keys(widgets).map((key) => (
          <Box
            key={key}
            sx={{
              '& > *': { height: '100%' },
              ...(isLocked ? {} : {
                '&:hover': {
                  outline: '2px dashed',
                  outlineColor: 'primary.main',
                  outlineOffset: -2,
                  borderRadius: 1,
                },
              }),
            }}
          >
            {!isLocked && (
              <Box className="drag-handle" sx={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 28, zIndex: 10,
                cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center',
                '&:active': { cursor: 'grabbing' },
              }}>
                <Box sx={{ width: 32, height: 4, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.15)' }} />
              </Box>
            )}
            {widgets[key]}
          </Box>
        ))}
      </ResponsiveGridLayout>
    </Box>
  );
};

export default Home;
