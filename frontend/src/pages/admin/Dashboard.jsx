import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  People as PeopleIcon,
  Visibility as ViewsIcon,
  PersonAdd as RegisterIcon,
  SupportAgent as ConsultIcon,
  Assignment as ProgramIcon,
  PendingActions as PendingIcon,
  ArrowForward as ArrowIcon,
  Close as CloseIcon,
  OpenInNew as OpenIcon,
  Circle as DotIcon,
  PlayCircle as LiveIcon,
  VideoLibrary as VideoIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const kpiData = [
  { id: 'users', label: '총 가입자 수', value: '2,847', change: +12.5, icon: <PeopleIcon />, color: '#0047BA', bg: '#EBF0FA' },
  { id: 'views', label: '총 페이지뷰', value: '45,632', change: +8.3, icon: <ViewsIcon />, color: '#059669', bg: '#ECFDF5' },
  { id: 'registrations', label: '이번 달 신규가입', value: '156', change: +23.1, icon: <RegisterIcon />, color: '#7C3AED', bg: '#F3F0FF' },
  { id: 'consultations', label: '총 상담 건수', value: '892', change: +5.7, icon: <ConsultIcon />, color: '#EA580C', bg: '#FFF7ED' },
  { id: 'programs', label: '활성 프로그램', value: '24', change: -2.1, icon: <ProgramIcon />, color: '#0891B2', bg: '#ECFEFF' },
  { id: 'pending', label: '미처리 승인', value: '18', change: -15.3, icon: <PendingIcon />, color: '#DC2626', bg: '#FEF2F2' },
];

const dailyLoginsData = [
  { date: '02/13', logins: 142, newUsers: 12 },
  { date: '02/14', logins: 158, newUsers: 18 },
  { date: '02/15', logins: 135, newUsers: 8 },
  { date: '02/16', logins: 89, newUsers: 5 },
  { date: '02/17', logins: 95, newUsers: 7 },
  { date: '02/18', logins: 167, newUsers: 22 },
  { date: '02/19', logins: 178, newUsers: 19 },
  { date: '02/20', logins: 192, newUsers: 25 },
  { date: '02/21', logins: 165, newUsers: 14 },
  { date: '02/22', logins: 148, newUsers: 11 },
  { date: '02/23', logins: 102, newUsers: 6 },
  { date: '02/24', logins: 98, newUsers: 8 },
  { date: '02/25', logins: 185, newUsers: 21 },
  { date: '02/26', logins: 201, newUsers: 28 },
];

const categoryRegistrations = [
  { name: '금융컨설팅', value: 342, color: '#0047BA' },
  { name: '부동산', value: 218, color: '#059669' },
  { name: '창업', value: 176, color: '#DC2626' },
  { name: '사회공헌', value: 134, color: '#7C3AED' },
  { name: '디지털', value: 289, color: '#2563EB' },
  { name: '건강', value: 198, color: '#0891B2' },
  { name: '여가', value: 87, color: '#EA580C' },
  { name: '재무', value: 156, color: '#F59E0B' },
];

const consultationsByInstructor = [
  { name: '김영수', consultations: 78, completionRate: 92, specialty: '금융컨설팅' },
  { name: '이미영', consultations: 65, completionRate: 88, specialty: '부동산' },
  { name: '박준혁', consultations: 54, completionRate: 95, specialty: '창업' },
  { name: '최수진', consultations: 48, completionRate: 90, specialty: '디지털' },
  { name: '정민호', consultations: 42, completionRate: 85, specialty: '건강' },
  { name: '한소영', consultations: 38, completionRate: 91, specialty: '사회공헌' },
];

const contentViews = [
  { name: '금융 기초 강좌', views: 3420, type: 'video', category: '금융컨설팅' },
  { name: '부동산 투자 세미나', views: 2890, type: 'live', category: '부동산' },
  { name: '디지털 역량 강화', views: 2654, type: 'program', category: '디지털' },
  { name: 'AI 활용 실무', views: 2340, type: 'video', category: '디지털' },
  { name: '창업 멘토링', views: 1980, type: 'event', category: '창업' },
  { name: '건강관리 프로그램', views: 1750, type: 'program', category: '건강' },
  { name: '재무설계 워크숍', views: 1620, type: 'live', category: '재무' },
  { name: '사회공헌 봉사활동', views: 1450, type: 'event', category: '사회공헌' },
];

const pipelineData = [
  { stage: '대기중', count: 24, color: '#F59E0B', bgColor: '#FFF7ED' },
  { stage: '심사중', count: 18, color: '#0047BA', bgColor: '#EBF0FA' },
  { stage: '승인완료', count: 142, color: '#059669', bgColor: '#ECFDF5' },
  { stage: '반려', count: 8, color: '#DC2626', bgColor: '#FEF2F2' },
];

const recentRegistrations = [
  { id: 1, user: '홍길동', email: 'hong@email.com', program: '금융 기초 강좌', category: '금융컨설팅', date: '2026-02-27', status: '승인대기', type: 'video' },
  { id: 2, user: '김철수', email: 'kim@email.com', program: '부동산 투자 세미나', category: '부동산', date: '2026-02-27', status: '승인완료', type: 'live' },
  { id: 3, user: '이영희', email: 'lee@email.com', program: '디지털 역량 강화', category: '디지털', date: '2026-02-26', status: '승인대기', type: 'program' },
  { id: 4, user: '박민수', email: 'park@email.com', program: 'AI 활용 실무', category: '디지털', date: '2026-02-26', status: '승인완료', type: 'video' },
  { id: 5, user: '최지우', email: 'choi@email.com', program: '창업 멘토링', category: '창업', date: '2026-02-25', status: '심사중', type: 'event' },
  { id: 6, user: '강서연', email: 'kang@email.com', program: '건강관리 프로그램', category: '건강', date: '2026-02-25', status: '승인완료', type: 'program' },
  { id: 7, user: '윤재호', email: 'yoon@email.com', program: '재무설계 워크숍', category: '재무', date: '2026-02-24', status: '반려', type: 'live' },
  { id: 8, user: '서하나', email: 'seo@email.com', program: '사회공헌 봉사활동', category: '사회공헌', date: '2026-02-24', status: '승인대기', type: 'event' },
];

const categoryDrillDown = {
  '금융컨설팅': [
    { name: '금융 기초 강좌', type: 'video', registrations: 128, views: 3420 },
    { name: '자산관리 세미나', type: 'live', registrations: 95, views: 2100 },
    { name: '금융 실무 과정', type: 'program', registrations: 72, views: 1800 },
    { name: '은퇴설계 상담', type: 'event', registrations: 47, views: 950 },
  ],
  '부동산': [
    { name: '부동산 투자 세미나', type: 'live', registrations: 98, views: 2890 },
    { name: '부동산 기초 강의', type: 'video', registrations: 75, views: 1900 },
    { name: '경매 실전 과정', type: 'program', registrations: 45, views: 1200 },
  ],
  '창업': [
    { name: '창업 멘토링', type: 'event', registrations: 82, views: 1980 },
    { name: '사업계획서 작성법', type: 'video', registrations: 56, views: 1400 },
    { name: '소자본 창업 특강', type: 'live', registrations: 38, views: 980 },
  ],
  '사회공헌': [
    { name: '사회공헌 봉사활동', type: 'event', registrations: 78, views: 1450 },
    { name: '시니어 멘토링', type: 'program', registrations: 56, views: 920 },
  ],
  '디지털': [
    { name: '디지털 역량 강화', type: 'program', registrations: 112, views: 2654 },
    { name: 'AI 활용 실무', type: 'video', registrations: 98, views: 2340 },
    { name: '코딩 기초반', type: 'live', registrations: 79, views: 1580 },
  ],
  '건강': [
    { name: '건강관리 프로그램', type: 'program', registrations: 95, views: 1750 },
    { name: '운동처방 강좌', type: 'video', registrations: 62, views: 1200 },
    { name: '마음건강 세미나', type: 'live', registrations: 41, views: 850 },
  ],
  '여가': [
    { name: '문화예술 체험', type: 'event', registrations: 52, views: 780 },
    { name: '여행 동아리', type: 'program', registrations: 35, views: 560 },
  ],
  '재무': [
    { name: '재무설계 워크숍', type: 'live', registrations: 88, views: 1620 },
    { name: '세금 절약 강좌', type: 'video', registrations: 68, views: 1250 },
  ],
};

const instructorDrillDown = {
  '김영수': [
    { client: '홍길동', program: '금융 기초 강좌', date: '2026-02-27', status: '완료' },
    { client: '이영희', program: '자산관리 세미나', date: '2026-02-26', status: '예약' },
    { client: '박민수', program: '금융 실무 과정', date: '2026-02-25', status: '완료' },
    { client: '최지우', program: '은퇴설계 상담', date: '2026-02-24', status: '취소' },
  ],
  '이미영': [
    { client: '강서연', program: '부동산 투자 세미나', date: '2026-02-27', status: '예약' },
    { client: '윤재호', program: '부동산 기초 강의', date: '2026-02-26', status: '완료' },
    { client: '서하나', program: '경매 실전 과정', date: '2026-02-25', status: '완료' },
  ],
  '박준혁': [
    { client: '김철수', program: '창업 멘토링', date: '2026-02-27', status: '완료' },
    { client: '홍길동', program: '사업계획서 작성법', date: '2026-02-26', status: '예약' },
  ],
  '최수진': [
    { client: '이영희', program: '디지털 역량 강화', date: '2026-02-27', status: '완료' },
    { client: '박민수', program: 'AI 활용 실무', date: '2026-02-26', status: '예약' },
  ],
  '정민호': [
    { client: '최지우', program: '건강관리 프로그램', date: '2026-02-27', status: '완료' },
    { client: '강서연', program: '운동처방 강좌', date: '2026-02-26', status: '예약' },
  ],
  '한소영': [
    { client: '윤재호', program: '사회공헌 봉사활동', date: '2026-02-27', status: '완료' },
    { client: '서하나', program: '시니어 멘토링', date: '2026-02-26', status: '완료' },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig = {
  '승인대기': { color: '#92400E', bg: '#FEF3C7' },
  '심사중': { color: '#1E40AF', bg: '#DBEAFE' },
  '승인완료': { color: '#166534', bg: '#DCFCE7' },
  '반려': { color: '#991B1B', bg: '#FEE2E2' },
  '완료': { color: '#166534', bg: '#DCFCE7' },
  '예약': { color: '#1E40AF', bg: '#DBEAFE' },
  '취소': { color: '#991B1B', bg: '#FEE2E2' },
};

const typeConfig = {
  video: { icon: <VideoIcon sx={{ fontSize: 14 }} />, label: '동영상 강좌', color: '#7C3AED' },
  live: { icon: <LiveIcon sx={{ fontSize: 14 }} />, label: '실시간 수업', color: '#DC2626' },
  program: { icon: <ProgramIcon sx={{ fontSize: 14 }} />, label: '프로그램', color: '#0047BA' },
  event: { icon: <EventIcon sx={{ fontSize: 14 }} />, label: '이벤트', color: '#059669' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ px: 2, py: 1.5, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry, i) => (
        <Typography key={i} variant="body2" sx={{ color: entry.color, fontWeight: 600 }}>
          {entry.name}: {entry.value.toLocaleString()}
        </Typography>
      ))}
    </Paper>
  );
};

const DashCard = ({ title, action, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: '12px',
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: '#fff',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...sx,
    }}
  >
    {(title || action) && (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        {title && <Typography variant="h6" sx={{ fontSize: '0.9375rem', fontWeight: 700 }}>{title}</Typography>}
        {action}
      </Box>
    )}
    <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
  </Paper>
);

// ─── Dashboard Component ─────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillData, setDrillData] = useState({ title: '', items: [], type: '' });
  const [tableTab, setTableTab] = useState(0);

  const totalRegistrations = useMemo(
    () => categoryRegistrations.reduce((sum, c) => sum + c.value, 0),
    []
  );

  const handlePieClick = (entry) => {
    const items = categoryDrillDown[entry.name] || [];
    setDrillData({ title: `${entry.name} - 등록 현황 (${entry.value}건)`, items, type: 'category' });
    setDrillOpen(true);
  };

  const handleBarClick = (entry) => {
    const items = instructorDrillDown[entry.name] || [];
    setDrillData({ title: `${entry.name} 상담사 - 상담 내역 (${entry.consultations}건)`, items, type: 'instructor' });
    setDrillOpen(true);
  };

  const handleContentClick = (item) => {
    setDrillData({ title: `${item.name} - 상세 정보`, items: [item], type: 'content' });
    setDrillOpen(true);
  };

  const handlePipelineClick = (stage) => {
    const statusMap = { '대기중': '승인대기', '심사중': '심사중', '승인완료': '승인완료', '반려': '반려' };
    const filtered = recentRegistrations.filter((r) => r.status === statusMap[stage.stage]);
    setDrillData({ title: `${stage.stage} - ${stage.count}건`, items: filtered, type: 'pipeline' });
    setDrillOpen(true);
  };

  const filteredRegistrations = useMemo(() => {
    if (tableTab === 0) return recentRegistrations;
    const statusMap = { 1: '승인대기', 2: '심사중', 3: '승인완료', 4: '반려' };
    return recentRegistrations.filter((r) => r.status === statusMap[tableTab]);
  }, [tableTab]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>관리자 대시보드</Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiData.map((kpi) => (
          <Grid item xs={6} sm={4} md={4} lg={2} key={kpi.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#fff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: kpi.color,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(kpi.color, 0.15)}`,
                },
              }}
              onClick={() => {
                if (kpi.id === 'users') navigate('/admin/users');
                if (kpi.id === 'programs') navigate('/admin/programs');
                if (kpi.id === 'pending') navigate('/admin/programs');
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: kpi.bg, color: kpi.color }}>
                  {React.cloneElement(kpi.icon, { fontSize: 'small' })}
                </Avatar>
                <Chip
                  size="small"
                  icon={kpi.change > 0 ? <TrendUpIcon sx={{ fontSize: '14px !important' }} /> : <TrendDownIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${kpi.change > 0 ? '+' : ''}${kpi.change}%`}
                  sx={{
                    height: 22, fontSize: '0.7rem', fontWeight: 600,
                    bgcolor: kpi.change > 0 ? '#ECFDF5' : '#FEF2F2',
                    color: kpi.change > 0 ? '#059669' : '#DC2626',
                    '& .MuiChip-icon': { color: kpi.change > 0 ? '#059669' : '#DC2626' },
                  }}
                />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25, fontSize: '1.35rem' }}>{kpi.value}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{kpi.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <DashCard title="일별 사용자 로그인">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyLoginsData}>
                <defs>
                  <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0047BA" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0047BA" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="newUserGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="logins" name="로그인 수" stroke="#0047BA" strokeWidth={2.5} fill="url(#loginGrad)" dot={{ r: 3, fill: '#0047BA' }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="newUsers" name="신규 가입" stroke="#7C3AED" strokeWidth={2} fill="url(#newUserGrad)" dot={{ r: 3, fill: '#7C3AED' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </DashCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashCard title="카테고리별 등록 현황">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryRegistrations} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" cursor="pointer" onClick={handlePieClick}>
                  {categoryRegistrations.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    const pct = ((d.value / totalRegistrations) * 100).toFixed(1);
                    return (
                      <Paper sx={{ px: 2, py: 1, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.value}건 ({pct}%)</Typography>
                      </Paper>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {categoryRegistrations.map((cat) => (
                <Chip
                  key={cat.name}
                  size="small"
                  label={`${cat.name} ${cat.value}`}
                  onClick={() => handlePieClick(cat)}
                  sx={{
                    height: 24, fontSize: '0.7rem',
                    bgcolor: alpha(cat.color, 0.1), color: cat.color,
                    fontWeight: 600, cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(cat.color, 0.2) },
                    '& .MuiChip-label': { px: 1 },
                  }}
                  icon={<DotIcon sx={{ fontSize: '8px !important', color: `${cat.color} !important` }} />}
                />
              ))}
            </Box>
          </DashCard>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <DashCard
            title="상담사별 상담 건수"
            action={<Chip label="전체 보기" size="small" onClick={() => navigate('/admin/programs')} sx={{ fontSize: '0.7rem', cursor: 'pointer' }} />}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={consultationsByInstructor} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" width={50} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <Paper sx={{ px: 2, py: 1.5, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography>
                        <Typography variant="caption" color="text.secondary">상담: {d.consultations}건</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>완료율: {d.completionRate}%</Typography>
                      </Paper>
                    );
                  }}
                />
                <Bar dataKey="consultations" name="상담 건수" fill="#0047BA" radius={[0, 6, 6, 0]} cursor="pointer" onClick={(data) => handleBarClick(data)} barSize={20}>
                  {consultationsByInstructor.map((_, i) => (
                    <Cell key={i} fill={`rgba(0, 71, 186, ${0.5 + (i / consultationsByInstructor.length) * 0.5})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DashCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashCard title="콘텐츠별 조회수 TOP 8">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={contentViews} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9CA3AF" angle={-25} textAnchor="end" height={60} interval={0} />
                <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    const t = typeConfig[d.type];
                    return (
                      <Paper sx={{ px: 2, py: 1.5, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          {t?.icon}
                          <Typography variant="caption" color="text.secondary">{t?.label}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#0047BA' }}>조회수: {d.views.toLocaleString()}</Typography>
                      </Paper>
                    );
                  }}
                />
                <Bar dataKey="views" name="조회수" radius={[6, 6, 0, 0]} cursor="pointer" onClick={(data) => handleContentClick(data)} barSize={28}>
                  {contentViews.map((item, i) => (<Cell key={i} fill={typeConfig[item.type]?.color || '#0047BA'} fillOpacity={0.8} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DashCard>
        </Grid>
      </Grid>

      {/* Pipeline */}
      <Box sx={{ mb: 3 }}>
        <DashCard title="신청 처리 파이프라인">
          <Grid container spacing={2}>
            {pipelineData.map((stage, i) => (
              <Grid item xs={6} sm={3} key={stage.stage}>
                <Paper
                  elevation={0}
                  onClick={() => handlePipelineClick(stage)}
                  sx={{
                    p: 2.5, borderRadius: '10px', bgcolor: stage.bgColor,
                    border: `1px solid ${alpha(stage.color, 0.2)}`,
                    cursor: 'pointer', transition: 'all 0.15s ease', position: 'relative',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(stage.color, 0.2)}` },
                  }}
                >
                  {i < pipelineData.length - 1 && (
                    <ArrowIcon sx={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', color: '#D1D5DB', fontSize: 20, display: { xs: 'none', sm: 'block' }, zIndex: 1 }} />
                  )}
                  <Typography variant="caption" sx={{ color: stage.color, fontWeight: 600, fontSize: '0.7rem' }}>{stage.stage}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: stage.color, mt: 0.5 }}>{stage.count}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DashCard>
      </Box>

      {/* Recent Registrations Table */}
      <DashCard
        title="최근 등록 현황"
        action={
          <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: '14px !important' }} />} onClick={() => navigate('/admin/programs')} sx={{ fontSize: '0.75rem' }}>
            전체 보기
          </Button>
        }
      >
        <Tabs
          value={tableTab}
          onChange={(_, v) => setTableTab(v)}
          sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0, fontSize: '0.8rem' } }}
        >
          <Tab label={`전체 (${recentRegistrations.length})`} />
          <Tab label={`대기 (${recentRegistrations.filter((r) => r.status === '승인대기').length})`} />
          <Tab label={`심사중 (${recentRegistrations.filter((r) => r.status === '심사중').length})`} />
          <Tab label={`승인 (${recentRegistrations.filter((r) => r.status === '승인완료').length})`} />
          <Tab label={`반려 (${recentRegistrations.filter((r) => r.status === '반려').length})`} />
        </Tabs>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>사용자</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>프로그램</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>유형</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>카테고리</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>등록일</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }} align="center">상세</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegistrations.map((row) => {
                const t = typeConfig[row.type];
                const s = statusConfig[row.status];
                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                    onClick={() => {
                      setDrillData({ title: `${row.user} - ${row.program}`, items: [row], type: 'registration' });
                      setDrillOpen(true);
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#0047BA' }}>{row.user.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>{row.user}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{row.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>{row.program}</Typography></TableCell>
                    <TableCell>
                      <Chip
                        size="small" icon={t?.icon} label={t?.label}
                        sx={{
                          height: 22, fontSize: '0.65rem',
                          bgcolor: alpha(t?.color || '#666', 0.1), color: t?.color, fontWeight: 500,
                          '& .MuiChip-icon': { color: `${t?.color} !important` },
                        }}
                      />
                    </TableCell>
                    <TableCell><Typography variant="caption" sx={{ fontSize: '0.75rem' }}>{row.category}</Typography></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{row.date}</Typography></TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} sx={{ height: 22, fontSize: '0.65rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small"><OpenIcon sx={{ fontSize: 16 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DashCard>

      {/* ─── Drill-Down Dialog ──────────────────────────────────────────── */}
      <Dialog open={drillOpen} onClose={() => setDrillOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>{drillData.title}</Typography>
          <IconButton size="small" onClick={() => setDrillOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {drillData.type === 'category' && (
            <List disablePadding>
              {drillData.items.map((item, i) => {
                const t = typeConfig[item.type];
                return (
                  <React.Fragment key={i}>
                    <ListItem sx={{ px: 3, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha(t?.color || '#666', 0.1), color: t?.color, width: 36, height: 36 }}>
                          {t?.icon || <ProgramIcon sx={{ fontSize: 18 }} />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`등록 ${item.registrations}건 | 조회수 ${item.views.toLocaleString()}`}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                      <Chip size="small" label={t?.label} sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(t?.color || '#666', 0.1), color: t?.color, fontWeight: 500 }} />
                    </ListItem>
                    {i < drillData.items.length - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                );
              })}
            </List>
          )}

          {drillData.type === 'instructor' && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>상담 대상</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>프로그램</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>날짜</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drillData.items.map((item, i) => {
                    const s = statusConfig[item.status];
                    return (
                      <TableRow key={i}>
                        <TableCell sx={{ fontSize: '0.8125rem' }}>{item.client}</TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem' }}>{item.program}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{item.date}</TableCell>
                        <TableCell>
                          <Chip size="small" label={item.status} sx={{ height: 22, fontSize: '0.65rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600 }} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {drillData.type === 'content' && drillData.items.map((item, i) => {
            const t = typeConfig[item.type];
            return (
              <Box key={i} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(t?.color || '#666', 0.1), color: t?.color, width: 44, height: 44 }}>
                    {t?.icon || <ProgramIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                    <Chip size="small" label={t?.label} sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(t?.color || '#666', 0.1), color: t?.color, fontWeight: 500 }} />
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: '8px', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">조회수</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0047BA' }}>{item.views?.toLocaleString() || '-'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: '8px', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">카테고리</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669' }}>{item.category || '-'}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            );
          })}

          {drillData.type === 'pipeline' && (
            <List disablePadding>
              {drillData.items.length === 0 ? (
                <ListItem sx={{ px: 3, py: 3, justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">해당 상태의 항목이 없습니다.</Typography>
                </ListItem>
              ) : (
                drillData.items.map((item, i) => {
                  const s = statusConfig[item.status];
                  const t = typeConfig[item.type];
                  return (
                    <React.Fragment key={i}>
                      <ListItem sx={{ px: 3, py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: '#0047BA' }}>{item.user.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${item.user} - ${item.program}`}
                          secondary={`${item.date} | ${item.category}`}
                          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip size="small" label={t?.label} sx={{ height: 20, fontSize: '0.6rem', bgcolor: alpha(t?.color || '#666', 0.1), color: t?.color }} />
                          <Chip size="small" label={item.status} sx={{ height: 20, fontSize: '0.6rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600 }} />
                        </Box>
                      </ListItem>
                      {i < drillData.items.length - 1 && <Divider variant="inset" />}
                    </React.Fragment>
                  );
                })
              )}
            </List>
          )}

          {drillData.type === 'registration' && drillData.items.map((item, i) => {
            const t = typeConfig[item.type];
            const s = statusConfig[item.status];
            return (
              <Box key={i} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: '#0047BA', fontSize: '1.1rem' }}>{item.user.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.user}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.email}</Typography>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">프로그램</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.program}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">카테고리</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.category}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">유형</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip size="small" icon={t?.icon} label={t?.label}
                        sx={{ height: 22, fontSize: '0.7rem', bgcolor: alpha(t?.color || '#666', 0.1), color: t?.color, '& .MuiChip-icon': { color: `${t?.color} !important` } }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">상태</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip size="small" label={item.status} sx={{ height: 22, fontSize: '0.7rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">등록일</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.date}</Typography>
                  </Grid>
                </Grid>
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" size="small" onClick={() => setDrillOpen(false)}>닫기</Button>
          {(drillData.type === 'category' || drillData.type === 'pipeline') && (
            <Button variant="contained" size="small" onClick={() => { setDrillOpen(false); navigate('/admin/programs'); }}>
              관리 페이지로 이동
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
