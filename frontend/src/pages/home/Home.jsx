import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Chat as ChatIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Support as SupportIcon,
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
  Campaign as CampaignIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

// ─── Constants ─────────────────────────────────
const CARD_RADIUS = '12px';
const CARD_BORDER = '1px solid #EAEDF0';
const CARD_HEIGHT_SM = 320;

const HOME_BANNER_STORAGE_KEY = 'woori_home_banners';
const HOMEPAGE_ORDER_KEY = 'woori_homepage_order';

const DEFAULT_SECTION_ORDER = ['announcements', 'status', 'programs', 'jobs'];

const loadSectionOrder = () => {
  try {
    const saved = localStorage.getItem(HOMEPAGE_ORDER_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_SECTION_ORDER;
};

const DEFAULT_HOME_BANNERS = [
  {
    id: 1, active: true,
    title: '2026년도 연간 교육 일정 안내',
    subtitle: '퇴직자 종사자를 위한',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=500&fit=crop',
    linkUrl: '/programs', linkText: '자세히 보기',
  },
  {
    id: 2, active: true,
    title: '맞춤형 재취업 컨설팅 오픈',
    subtitle: '전문가와 함께하는 커리어 설계',
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=500&fit=crop',
    linkUrl: '/consultations/booking', linkText: '자세히 보기',
  },
  {
    id: 3, active: true,
    title: '새로운 온라인 강좌 오픈',
    subtitle: '언제 어디서나 학습하세요',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=500&fit=crop',
    linkUrl: '/learning', linkText: '자세히 보기',
  },
];

const loadHomeBanners = () => {
  try {
    const saved = localStorage.getItem(HOME_BANNER_STORAGE_KEY);
    if (saved) return JSON.parse(saved).filter((b) => b.active);
  } catch { /* ignore */ }
  return DEFAULT_HOME_BANNERS;
};

// ─── Banner Carousel ─────────────────────────────────
const HomeBannerCarousel = () => {
  const navigate = useNavigate();
  const [banners] = useState(loadHomeBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goTo = useCallback((index) => {
    setCurrentIndex((index + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const timer = setInterval(() => setCurrentIndex((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length, isHovered]);

  if (banners.length === 0) return null;
  const current = banners[currentIndex];

  return (
    <Box
      sx={{
        position: 'relative', mb: 4, borderRadius: { xs: '12px', md: '16px' },
        overflow: 'hidden', width: '100%',
        height: { xs: 180, sm: 280, md: 360 },
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', transform: `translateX(-${currentIndex * 100}%)` }}>
        {banners.map((banner, i) => (
          <Box key={banner.id} sx={{
            position: 'relative', minWidth: '100%', height: '100%',
            backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : 'linear-gradient(135deg, #1a3a6b 0%, #0047BA 100%)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            '&::after': {
              content: '""', position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
            },
          }} />
        ))}
      </Box>

      {/* Content overlay */}
      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        px: { xs: 3, sm: 5, md: 7 }, py: 3,
      }}>
        {current.subtitle && (
          <Typography sx={{
            color: 'rgba(255,255,255,0.85)', mb: 0.5,
            fontSize: { xs: '0.78rem', sm: '0.95rem', md: '1.05rem' },
            fontWeight: 400, letterSpacing: '0.3px',
          }}>
            {current.subtitle}
          </Typography>
        )}
        <Typography sx={{
          color: '#fff', fontWeight: 800, mb: { xs: 1.5, md: 2.5 },
          fontSize: { xs: '1.2rem', sm: '1.7rem', md: '2.2rem' },
          lineHeight: 1.2, maxWidth: { xs: '80%', md: '55%' },
        }}>
          {current.title}
        </Typography>
        {current.linkText && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => current.linkUrl && navigate(current.linkUrl)}
            sx={{
              color: '#fff', borderColor: 'rgba(255,255,255,0.6)',
              borderRadius: '24px', px: 3, py: 0.8,
              fontWeight: 600, fontSize: { xs: '0.78rem', md: '0.85rem' },
              width: 'fit-content', backdropFilter: 'blur(4px)',
              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.15)' },
            }}
          >
            {current.linkText}
          </Button>
        )}
      </Box>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <IconButton onClick={() => goTo(currentIndex - 1)} sx={{
            position: 'absolute', left: { xs: 6, md: 12 }, top: '50%', transform: 'translateY(-50%)', zIndex: 2,
            color: '#fff', bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)',
            width: { xs: 36, md: 44 }, height: { xs: 36, md: 44 },
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
          }}>
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={() => goTo(currentIndex + 1)} sx={{
            position: 'absolute', right: { xs: 6, md: 12 }, top: '50%', transform: 'translateY(-50%)', zIndex: 2,
            color: '#fff', bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)',
            width: { xs: 36, md: 44 }, height: { xs: 36, md: 44 },
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
          }}>
            <ChevronRight />
          </IconButton>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <Box sx={{
          position: 'absolute', bottom: { xs: 10, md: 16 }, left: '50%',
          transform: 'translateX(-50%)', zIndex: 2, display: 'flex', gap: 0.8,
        }}>
          {banners.map((_, i) => (
            <Box key={i} onClick={() => goTo(i)} sx={{
              width: i === currentIndex ? 24 : 8, height: 8,
              borderRadius: 4, cursor: 'pointer',
              bgcolor: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.35s ease',
            }} />
          ))}
        </Box>
      )}

      {/* Counter */}
      {banners.length > 1 && (
        <Box sx={{
          position: 'absolute', bottom: { xs: 10, md: 16 }, right: { xs: 10, md: 20 }, zIndex: 2,
          bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '10px', px: 1.2, py: 0.3,
        }}>
          <Typography sx={{ color: '#fff', fontSize: '0.68rem', fontWeight: 600 }}>
            {currentIndex + 1} / {banners.length}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ─── Quick Menu ─────────────────────────────────
const QuickMenu = () => {
  const navigate = useNavigate();
  const items = [
    { icon: <CampaignIcon />, label: '공지사항', path: '/announcements', color: '#0047BA', bg: '#EBF0FA' },
    { icon: <AssignmentIcon />, label: '프로그램 신청', path: '/programs', color: '#059669', bg: '#ECFDF5' },
    { icon: <ChatIcon />, label: '상담 예약', path: '/consultations/booking', color: '#D97706', bg: '#FFFBEB' },
    { icon: <WorkIcon />, label: '채용정보', path: '/jobs', color: '#DC2626', bg: '#FEF2F2' },
    { icon: <SchoolIcon />, label: '온라인 학습', path: '/learning', color: '#7C3AED', bg: '#F5F3FF' },
    { icon: <SupportIcon />, label: '고객지원', path: '/support', color: '#0891B2', bg: '#ECFEFF' },
  ];

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(6, 1fr)' },
      gap: { xs: 1, sm: 1, md: 1.5 }, mb: 4,
      width: '100%', minWidth: 0, overflow: 'hidden',
    }}>
      {items.map((item, i) => (
        <Paper
          key={i} elevation={0}
          onClick={() => navigate(item.path)}
          sx={{
            textAlign: 'center', py: { xs: 1.5, md: 2 }, px: 0.5,
            borderRadius: CARD_RADIUS, cursor: 'pointer', border: CARD_BORDER,
            transition: 'all 0.2s ease', bgcolor: '#fff', minWidth: 0, overflow: 'hidden',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)', borderColor: item.color },
          }}
        >
          <Box sx={{
            width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 },
            borderRadius: '12px', bgcolor: item.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 0.8,
          }}>
            {React.cloneElement(item.icon, { sx: { fontSize: { xs: 20, md: 24 }, color: item.color } })}
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.72rem', sm: '0.78rem', md: '0.82rem' }, color: '#333' }}>
            {item.label}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

// ─── Section Header ─────────────────────────────────
const SectionHeader = ({ title, onMore }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
    <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' }, color: '#1a1a1a' }}>
      {title}
    </Typography>
    {onMore && (
      <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
        onClick={onMore} sx={{ fontSize: '0.78rem', color: '#888', fontWeight: 500, minWidth: 'auto', '&:hover': { color: '#0047BA' } }}>
        더보기
      </Button>
    )}
  </Box>
);

// ─── Uniform Card Wrapper ─────────────────────────────────
const SectionCard = ({ children, minHeight }) => (
  <Card elevation={0} sx={{
    borderRadius: CARD_RADIUS, border: CARD_BORDER, bgcolor: '#fff',
    height: '100%', minHeight: minHeight || CARD_HEIGHT_SM,
    display: 'flex', flexDirection: 'column',
  }}>
    <CardContent sx={{ p: { xs: 2, md: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column', '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
      {children}
    </CardContent>
  </Card>
);

// ─── Announcements ─────────────────────────────────
const AnnouncementSection = ({ announcements, loading }) => {
  const navigate = useNavigate();
  const items = announcements?.length > 0 ? announcements : [
    { id: 1, title: '2026년 상반기 퇴직자 교육 일정 안내', type: '긴급', date: '2026.03.20' },
    { id: 2, title: '3월 퇴직자 네트워킹 프로그램 참여 신청 마감', type: '안내', date: '2026.03.18' },
    { id: 3, title: '맞춤형 재취업 컨설팅 신규 과정 개설', type: '안내', date: '2026.03.15' },
    { id: 4, title: '온라인 강의 신규 콘텐츠 업데이트', type: '일반', date: '2026.03.12' },
  ];

  const typeColors = {
    '긴급': { bg: '#FEE2E2', color: '#991B1B' },
    '안내': { bg: '#DBEAFE', color: '#1E40AF' },
    '중요': { bg: '#FEF3C7', color: '#92400E' },
    '일반': { bg: '#F3F4F6', color: '#4B5563' },
  };

  if (loading) return <SectionCard><Box>{[1,2,3].map(i => <Skeleton key={i} height={52} sx={{ borderRadius: '8px', mb: 0.5 }} />)}</Box></SectionCard>;

  return (
    <SectionCard>
      <SectionHeader title="중요 공지사항" onMore={() => navigate('/announcements')} />
      <Box sx={{ flex: 1 }}>
        {items.slice(0, 4).map((item, index) => (
          <Box key={item.id} onClick={() => navigate('/announcements')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, py: 1.3, cursor: 'pointer',
              borderTop: index > 0 ? '1px solid #F5F5F5' : 'none',
              '&:hover': { '& .title-text': { color: '#0047BA' } },
            }}>
            <Chip label={item.type} size="small" sx={{
              bgcolor: (typeColors[item.type] || typeColors['일반']).bg,
              color: (typeColors[item.type] || typeColors['일반']).color,
              fontWeight: 600, minWidth: 44, fontSize: '0.68rem', height: 22,
            }} />
            <Typography className="title-text" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 450, transition: 'color 0.15s' }}>
              {item.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#aaa', flexShrink: 0, fontSize: '0.72rem' }}>{item.date}</Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
};

// ─── My Status ─────────────────────────────────
const MyStatusCard = ({ stats, loading }) => {
  const { t } = useTranslation();
  if (loading) return <SectionCard minHeight="auto"><Skeleton height={100} sx={{ borderRadius: '8px' }} /></SectionCard>;

  const items = [
    { icon: <AssignmentIcon />, label: t('home.appliedPrograms'), value: stats?.appliedPrograms || 2, color: '#0047BA', bg: '#EBF0FA' },
    { icon: <ChatIcon />, label: t('home.scheduledConsultations'), value: stats?.scheduledConsultations || 1, color: '#D97706', bg: '#FFFBEB' },
    { icon: <SchoolIcon />, label: t('home.ongoingCourses'), value: stats?.ongoingCourses || 1, color: '#059669', bg: '#ECFDF5' },
  ];

  return (
    <SectionCard minHeight="auto">
      <SectionHeader title="나의 현황" />
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)' },
        gap: { xs: 1, md: 2 },
      }}>
        {items.map((item, i) => (
          <Paper key={i} elevation={0} sx={{
            display: 'flex', flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center', gap: { xs: 1, md: 2 },
            p: { xs: 1.5, md: 2 },
            borderRadius: '10px', border: CARD_BORDER,
            textAlign: { xs: 'center', md: 'left' },
          }}>
            <Box sx={{
              width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 },
              borderRadius: '12px', bgcolor: item.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {React.cloneElement(item.icon, { sx: { fontSize: { xs: 20, md: 24 }, color: item.color } })}
            </Box>
            <Box>
              <Typography sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' }, color: '#999', lineHeight: 1.2 }}>{item.label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', md: '1.4rem' }, lineHeight: 1.2, color: item.color }}>{item.value}건</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </SectionCard>
  );
};

// ─── Programs ─────────────────────────────────
const ProgramsSection = ({ programs, loading }) => {
  const navigate = useNavigate();
  const items = programs?.length > 0 ? programs : [
    { id: 1, title: '은퇴 후 자산관리 심화 과정', category: '금융컨설팅', period: '2026.03.01 ~ 2026.03.31', dDay: 7, status: '진행중' },
    { id: 2, title: '퇴직 임원 리더십 코칭', category: '창업', period: '2026.04.01 ~ 2026.04.30', dDay: 21, status: '접수중' },
    { id: 3, title: '디지털 금융 활용 교육', category: '디지털', period: '2026.04.15 ~ 2026.05.15', dDay: 35, status: '모집중' },
    { id: 4, title: '건강한 노후를 위한 식단 관리', category: '건강', period: '2026.05.01 ~ 2026.05.31', dDay: 45, status: '모집중' },
  ];

  if (loading) return (
    <SectionCard minHeight="auto">
      <SectionHeader title="진행 중인 프로그램" />
      <Grid container spacing={1.5}>{[1,2,3,4].map(i => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton height={160} sx={{ borderRadius: '10px' }} /></Grid>)}</Grid>
    </SectionCard>
  );

  const ProgramCard = ({ p }) => (
    <Paper elevation={0} onClick={() => navigate(`/programs/${p.id}`)}
      sx={{
        p: { xs: 1.5, md: 2 }, borderRadius: '10px', cursor: 'pointer', border: CARD_BORDER,
        aspectRatio: '4 / 3', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'all 0.15s', '&:hover': { borderColor: '#C5D1E0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
      }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 0.5, flexWrap: 'wrap' }}>
        <CategoryBadge category={p.category} />
        <StatusBadge status={p.status} />
      </Box>
      <Typography sx={{
        fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.9rem' }, mb: 0.3, lineHeight: 1.3,
        overflow: 'hidden', textOverflow: 'ellipsis',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>{p.title}</Typography>
      <Typography sx={{ fontSize: { xs: '0.68rem', md: '0.75rem' }, color: '#999', mb: 'auto' }}>{p.period}</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.2rem' }, color: '#0047BA' }}>D-{p.dDay}</Typography>
        <Button variant="outlined" size="small" sx={{ borderRadius: '8px', fontSize: { xs: '0.68rem', md: '0.75rem' }, fontWeight: 600, py: 0.3, minWidth: { xs: 52, md: 64 } }}>
          {p.status === '진행중' ? '학습하기' : '상세보기'}
        </Button>
      </Box>
    </Paper>
  );

  return (
    <SectionCard minHeight="auto">
      <SectionHeader title="진행 중인 프로그램" onMore={() => navigate('/programs')} />
      <Grid container spacing={1.5} sx={{ flex: 1 }}>
        {items.slice(0, 6).map((p) => (
          <Grid item xs={6} sm={6} md={3} key={p.id}>
            <ProgramCard p={p} />
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
};

// ─── Jobs ─────────────────────────────────
const JobSection = ({ jobs, loading }) => {
  const navigate = useNavigate();
  const items = jobs?.length > 0 ? jobs : [
    { id: 1, company: '(주)한화생명', position: '시니어 금융 전문 컨설턴트', location: '서울 중구', type: '계약직' },
    { id: 2, company: 'KB국민은행', position: '디지털 금융 플랫폼 기획자', location: '서울 여의도', type: '정규직' },
    { id: 3, company: '삼성생명', position: '퇴직연금 전문 상담역', location: '서울 강남구', type: '정규직' },
    { id: 4, company: '현대건설', position: '부동산 자문위원', location: '경기 성남시', type: '프리랜서' },
    { id: 5, company: '신한은행', position: '자산관리 시니어 컨설턴트', location: '서울 강남구', type: '정규직' },
    { id: 6, company: 'NH농협', position: '농촌 금융 전문 상담역', location: '전국', type: '계약직' },
  ];

  if (loading) return <SectionCard><Box>{[1,2,3].map(i => <Skeleton key={i} height={72} sx={{ borderRadius: '10px', mb: 1 }} />)}</Box></SectionCard>;

  const JobCard = ({ job }) => (
    <Paper elevation={0} onClick={() => navigate(`/jobs/${job.id}`)}
      sx={{
        p: { xs: 1.5, md: 2 }, borderRadius: '10px', cursor: 'pointer', border: CARD_BORDER,
        aspectRatio: '4 / 3', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'all 0.15s',
        '&:hover': { borderColor: '#C5D1E0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
      }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: '0.65rem', md: '0.72rem' }, color: '#999', fontWeight: 500, mb: 0.3 }}>{job.company}</Typography>
          <Typography sx={{
            fontWeight: 600, fontSize: { xs: '0.78rem', md: '0.88rem' }, mb: 0.5, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{job.position}</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: { xs: '0.62rem', md: '0.72rem' }, color: '#aaa' }}>{job.location}</Typography>
            {job.type && <Chip label={job.type} size="small" sx={{ height: 18, fontSize: { xs: '0.58rem', md: '0.62rem' }, fontWeight: 600 }} />}
          </Box>
        </Box>
        <IconButton size="small" sx={{ color: '#ddd', mt: -0.5, display: { xs: 'none', sm: 'flex' } }}><BookmarkIcon sx={{ fontSize: 18 }} /></IconButton>
      </Box>
    </Paper>
  );

  return (
    <SectionCard minHeight="auto">
      <SectionHeader title="추천 채용정보" onMore={() => navigate('/jobs')} />
      <Grid container spacing={1.5}>
        {items.slice(0, 6).map((job) => (
          <Grid item xs={6} sm={6} md={4} key={job.id}>
            <JobCard job={job} />
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
};

// ─── Main Home ─────────────────────────────────
const Home = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [sectionOrder] = useState(loadSectionOrder);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardAPI.getHome();
        setDashboardData(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sectionComponents = {
    announcements: isAuthenticated ? (
      <AnnouncementSection key="announcements" announcements={dashboardData?.announcements} loading={loading} />
    ) : null,
    status: isAuthenticated ? (
      <MyStatusCard key="status" stats={dashboardData?.stats} loading={loading} />
    ) : null,
    programs: (
      <ProgramsSection key="programs" programs={dashboardData?.programs} loading={loading} />
    ),
    jobs: (
      <JobSection key="jobs" jobs={dashboardData?.jobs} loading={loading} />
    ),
  };

  return (
    <Box>
      <HomeBannerCarousel />
      <QuickMenu />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
        {sectionOrder.map((key) => sectionComponents[key]).filter(Boolean)}
      </Box>
    </Box>
  );
};

export default Home;
