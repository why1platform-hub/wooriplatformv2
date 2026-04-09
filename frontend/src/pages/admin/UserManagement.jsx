import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, InputAdornment, IconButton, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl,
  InputLabel, Select, Divider, Avatar, Tabs, Tab, LinearProgress, Card,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  Search as SearchIcon, MoreVert as MoreVertIcon, Edit as EditIcon,
  Block as BlockIcon, CheckCircle as ActiveIcon,
  Delete as DeleteIcon, PersonAdd as PersonAddIcon,
  Visibility as DetailIcon, Close as CloseIcon,
  School as SchoolIcon, Assignment as AssignmentIcon,
  Chat as ChatIcon, Work as WorkIcon,
  TrendingUp as TrendingUpIcon, AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon, Star as StarIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

const INITIAL_USERS = [
  { id: 1, name_ko: '관리자', name_en: 'Admin', email: 'admin@woori.com', role: 'admin', status: 'active', department: '시스템관리팀', phone: '', created_at: '2024.01.01', last_login: '2026.03.25', retirement_date: '', birth_date: '', address: '', skills: '', bio: '시스템 관리자' },
  { id: 2, name_ko: '박지영', name_en: 'Park Jiyoung', email: 'instructor1@woori.com', role: 'consultant', status: 'active', department: '전직지원팀', phone: '010-1234-5678', created_at: '2024.01.10', last_login: '2026.03.25', retirement_date: '', birth_date: '1978.05.12', address: '서울시 중구', skills: '커리어상담, 금융컨설팅', bio: '전직지원 전문 상담사 10년 경력' },
  { id: 3, name_ko: '이민호', name_en: 'Lee Minho', email: 'instructor2@woori.com', role: 'consultant', status: 'active', department: '전직지원팀', phone: '010-2345-6789', created_at: '2024.01.10', last_login: '2026.03.25', retirement_date: '', birth_date: '1980.11.03', address: '서울시 강남구', skills: '창업상담, 진로설계', bio: '전직지원 상담사 8년 경력' },
  { id: 4, name_ko: '홍길동', name_en: 'Hong Gildong', email: 'user1@woori.com', role: 'learner', status: 'active', department: '금융컨설팅팀', phone: '010-3456-7890', created_at: '2024.01.15', last_login: '2026.03.25', retirement_date: '2026.01.15', birth_date: '1968.03.15', address: '서울시 강남구', skills: '자산관리, 투자상담, 고객관리', bio: '우리은행 금융컨설팅팀 28년 근무' },
  { id: 5, name_ko: '김영희', name_en: 'Kim Younghee', email: 'user2@woori.com', role: 'learner', status: 'active', department: '부동산팀', phone: '010-4567-8901', created_at: '2024.02.10', last_login: '2026.03.25', retirement_date: '2026.03.01', birth_date: '1970.07.22', address: '서울시 서초구', skills: '부동산분석, 고객상담', bio: '부동산팀 근무 경력' },
  { id: 6, name_ko: '이철수', name_en: 'Lee Cheolsu', email: 'user3@woori.com', role: 'learner', status: 'active', department: '자산관리팀', phone: '010-5678-9012', created_at: '2024.03.05', last_login: '2026.03.25', retirement_date: '2026.06.30', birth_date: '1965.09.10', address: '경기도 성남시', skills: '자산운용, 리스크관리', bio: '자산관리팀 25년 근무' },
];

const ROLE_OPTIONS = [
  { value: 'learner', label: '학습자' },
  { value: 'consultant', label: '상담사' },
  { value: 'admin', label: '관리자' },
];

// Mock activity data generator
const generateUserStats = (user) => {
  const isConsultant = user.role === 'instructor';
  const isCounselor = user.role === 'career_counselor';

  if (isConsultant) {
    return {
      coursesCreated: Math.floor(Math.random() * 8) + 2,
      totalStudents: Math.floor(Math.random() * 200) + 30,
      avgRating: (3.5 + Math.random() * 1.5).toFixed(1),
      totalLessons: Math.floor(Math.random() * 40) + 10,
      completionRate: Math.floor(Math.random() * 30) + 65,
      totalHours: Math.floor(Math.random() * 100) + 20,
      recentCourses: [
        { title: 'AI 활용 실무 기초', students: 45, rating: 4.6, status: '진행중' },
        { title: '데이터 분석 입문', students: 32, rating: 4.3, status: '완료' },
        { title: '디지털 마케팅 전략', students: 28, rating: 4.8, status: '준비중' },
      ],
      monthlyActivity: [
        { month: '1월', sessions: 12 }, { month: '2월', sessions: 15 },
        { month: '3월', sessions: 18 }, { month: '4월', sessions: 14 },
        { month: '5월', sessions: 20 },
      ],
    };
  }

  if (isCounselor) {
    return {
      totalConsultations: Math.floor(Math.random() * 100) + 30,
      completedConsultations: Math.floor(Math.random() * 80) + 20,
      avgSessionTime: Math.floor(Math.random() * 20) + 30,
      satisfactionRate: Math.floor(Math.random() * 15) + 80,
      specialties: ['커리어 전환', '이력서 컨설팅', '면접 준비'],
      recentConsultations: [
        { client: '홍길동', date: '2024.05.18', type: '커리어 상담', status: '완료' },
        { client: '김영희', date: '2024.05.20', type: '이력서 검토', status: '완료' },
        { client: '강민호', date: '2024.05.22', type: '면접 준비', status: '예정' },
      ],
      monthlyActivity: [
        { month: '1월', sessions: 8 }, { month: '2월', sessions: 12 },
        { month: '3월', sessions: 15 }, { month: '4월', sessions: 11 },
        { month: '5월', sessions: 18 },
      ],
    };
  }

  // Learner stats
  return {
    enrolledCourses: Math.floor(Math.random() * 5) + 1,
    completedCourses: Math.floor(Math.random() * 3),
    totalLearningHours: Math.floor(Math.random() * 50) + 5,
    overallProgress: Math.floor(Math.random() * 60) + 20,
    appliedPrograms: Math.floor(Math.random() * 4) + 1,
    consultations: Math.floor(Math.random() * 3),
    jobApplications: Math.floor(Math.random() * 5),
    certificates: Math.floor(Math.random() * 2),
    recentActivity: [
      { action: '강좌 수강', detail: 'AI 활용 실무 기초 - 3강 완료', date: '2024.05.20' },
      { action: '프로그램 신청', detail: '은퇴 후 자산관리 심화 과정', date: '2024.05.18' },
      { action: '상담 완료', detail: '커리어 전환 상담', date: '2024.05.15' },
      { action: '채용 지원', detail: '시니어 금융 컨설턴트', date: '2024.05.12' },
    ],
    courseProgress: [
      { title: 'AI 활용 실무 기초', progress: 65, lastAccess: '2024.05.20' },
      { title: '은퇴 후 자산 관리', progress: 100, lastAccess: '2024.05.10' },
      { title: '디지털 마케팅 입문', progress: 30, lastAccess: '2024.05.17' },
    ],
  };
};

// User Detail Stats Dialog
const UserDetailDialog = ({ open, onClose, user }) => {
  const [tab, setTab] = useState(0);
  const detailTheme = useTheme();
  const detailIsMobile = useMediaQuery(detailTheme.breakpoints.down('md'));

  if (!user) return null;

  const stats = generateUserStats(user);
  const isConsultant = user.role === 'instructor';
  const isCounselor = user.role === 'career_counselor';
  const isLearner = user.role === 'learner';

  const getRoleLabel = (role) => ROLE_OPTIONS.find((r) => r.value === role)?.label || role;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={detailIsMobile} PaperProps={{ sx: { borderRadius: detailIsMobile ? 0 : '12px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>사용자 상세 정보</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {/* User Profile Header */}
        <Box sx={{ bgcolor: '#F0F4FF', px: 3, py: 2.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: 2.5 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#0047BA', fontSize: '1.5rem' }}>
            {user.name_ko.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight={700}>{user.name_ko}</Typography>
              {user.name_en && <Typography variant="body2" color="text.secondary">({user.name_en})</Typography>}
            </Box>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip label={getRoleLabel(user.role)} size="small" color="primary" variant="outlined" />
              <Chip label={user.department} size="small" variant="outlined" />
              {user.retirement_date && <Chip label={`퇴직: ${user.retirement_date}`} size="small" variant="outlined" />}
            </Box>
          </Box>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="caption" color="text.secondary" display="block">가입일: {user.created_at}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">최근 로그인: {user.last_login}</Typography>
            {user.phone && <Typography variant="caption" color="text.secondary" display="block">{user.phone}</Typography>}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label="활동 통계" sx={{ fontSize: '0.875rem' }} />
          <Tab label={isConsultant ? '강의 현황' : isCounselor ? '상담 현황' : '학습 현황'} sx={{ fontSize: '0.875rem' }} />
          <Tab label="최근 활동" sx={{ fontSize: '0.875rem' }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 0: Stats Overview */}
          {tab === 0 && (
            <Grid container spacing={2}>
              {isLearner && (
                <>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="h4" fontWeight={700}>{stats.enrolledCourses}</Typography>
                      <Typography variant="caption" color="text.secondary">수강 중 강좌</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <ActiveIcon color="success" />
                      <Typography variant="h4" fontWeight={700}>{stats.completedCourses}</Typography>
                      <Typography variant="caption" color="text.secondary">완료 강좌</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <TimeIcon color="info" />
                      <Typography variant="h4" fontWeight={700}>{stats.totalLearningHours}</Typography>
                      <Typography variant="caption" color="text.secondary">총 학습 시간(h)</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <TrendingUpIcon color="warning" />
                      <Typography variant="h4" fontWeight={700}>{stats.overallProgress}%</Typography>
                      <Typography variant="caption" color="text.secondary">전체 진도율</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <AssignmentIcon sx={{ color: '#7C3AED' }} />
                      <Typography variant="h4" fontWeight={700}>{stats.appliedPrograms}</Typography>
                      <Typography variant="caption" color="text.secondary">프로그램 신청</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <ChatIcon sx={{ color: '#059669' }} />
                      <Typography variant="h4" fontWeight={700}>{stats.consultations}</Typography>
                      <Typography variant="caption" color="text.secondary">상담 횟수</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <WorkIcon sx={{ color: '#EA580C' }} />
                      <Typography variant="h4" fontWeight={700}>{stats.jobApplications}</Typography>
                      <Typography variant="caption" color="text.secondary">채용 지원</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <StarIcon sx={{ color: '#D97706' }} />
                      <Typography variant="h4" fontWeight={700}>{stats.certificates}</Typography>
                      <Typography variant="caption" color="text.secondary">수료증</Typography>
                    </Card>
                  </Grid>
                </>
              )}

              {isConsultant && (
                <>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="h4" fontWeight={700}>{stats.coursesCreated}</Typography>
                      <Typography variant="caption" color="text.secondary">개설 강좌</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <AssignmentIcon color="info" />
                      <Typography variant="h4" fontWeight={700}>{stats.totalStudents}</Typography>
                      <Typography variant="caption" color="text.secondary">총 수강생</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <StarIcon sx={{ color: '#D97706' }} />
                      <Typography variant="h4" fontWeight={700}>{stats.avgRating}</Typography>
                      <Typography variant="caption" color="text.secondary">평균 평점</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <TrendingUpIcon color="success" />
                      <Typography variant="h4" fontWeight={700}>{stats.completionRate}%</Typography>
                      <Typography variant="caption" color="text.secondary">수료율</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <TimeIcon color="warning" />
                      <Typography variant="h4" fontWeight={700}>{stats.totalHours}</Typography>
                      <Typography variant="caption" color="text.secondary">총 강의 시간(h)</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <CalendarIcon sx={{ color: '#7C3AED' }} />
                      <Typography variant="h4" fontWeight={700}>{stats.totalLessons}</Typography>
                      <Typography variant="caption" color="text.secondary">총 레슨 수</Typography>
                    </Card>
                  </Grid>
                </>
              )}

              {isCounselor && (
                <>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <ChatIcon color="primary" />
                      <Typography variant="h4" fontWeight={700}>{stats.totalConsultations}</Typography>
                      <Typography variant="caption" color="text.secondary">총 상담 건수</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <ActiveIcon color="success" />
                      <Typography variant="h4" fontWeight={700}>{stats.completedConsultations}</Typography>
                      <Typography variant="caption" color="text.secondary">완료 상담</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <TimeIcon color="info" />
                      <Typography variant="h4" fontWeight={700}>{stats.avgSessionTime}분</Typography>
                      <Typography variant="caption" color="text.secondary">평균 상담 시간</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <TrendingUpIcon color="warning" />
                      <Typography variant="h4" fontWeight={700}>{stats.satisfactionRate}%</Typography>
                      <Typography variant="caption" color="text.secondary">만족도</Typography>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Monthly Activity Chart (simple bar) */}
              {(isConsultant || isCounselor) && stats.monthlyActivity && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>월별 활동 추이</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 120 }}>
                      {stats.monthlyActivity.map((m) => {
                        const maxVal = Math.max(...stats.monthlyActivity.map((x) => x.sessions));
                        const height = maxVal > 0 ? (m.sessions / maxVal) * 100 : 0;
                        return (
                          <Box key={m.month} sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography variant="caption" fontWeight={600}>{m.sessions}</Typography>
                            <Box sx={{ height: `${height}%`, bgcolor: '#0047BA', borderRadius: '4px 4px 0 0', minHeight: 4, mx: 'auto', width: '60%' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{m.month}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {/* Tab 1: Course/Consultation Details */}
          {tab === 1 && (
            <Box>
              {isLearner && stats.courseProgress && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>수강 강좌 현황</Typography>
                  {stats.courseProgress.map((course, i) => (
                    <Card key={i} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{course.title}</Typography>
                        <Chip label={course.progress === 100 ? '완료' : '진행중'} size="small"
                          color={course.progress === 100 ? 'success' : 'primary'} />
                      </Box>
                      <LinearProgress variant="determinate" value={course.progress} sx={{ height: 8, borderRadius: 4, mb: 0.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">진도율: {course.progress}%</Typography>
                        <Typography variant="caption" color="text.secondary">최근 접속: {course.lastAccess}</Typography>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}

              {isConsultant && stats.recentCourses && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>강의 현황</Typography>
                  {stats.recentCourses.map((course, i) => (
                    <Card key={i} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{course.title}</Typography>
                        <Chip label={course.status} size="small"
                          color={course.status === '진행중' ? 'primary' : course.status === '완료' ? 'success' : 'default'} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="caption" color="text.secondary">수강생: {course.students}명</Typography>
                        <Typography variant="caption" color="text.secondary">평점: {course.rating}</Typography>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}

              {isCounselor && stats.recentConsultations && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>상담 현황</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {stats.specialties.map((s, i) => <Chip key={i} label={s} size="small" variant="outlined" />)}
                  </Box>
                  {stats.recentConsultations.map((c, i) => (
                    <Card key={i} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{c.client} - {c.type}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.date}</Typography>
                        </Box>
                        <Chip label={c.status} size="small"
                          color={c.status === '완료' ? 'success' : 'warning'} />
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Tab 2: Recent Activity */}
          {tab === 2 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>최근 활동 내역</Typography>
              {isLearner && stats.recentActivity ? (
                stats.recentActivity.map((activity, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Chip label={activity.action} size="small" sx={{ minWidth: 80 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{activity.detail}</Typography>
                      <Typography variant="caption" color="text.secondary">{activity.date}</Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    최근 로그인: {user.last_login}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    가입일: {user.created_at}
                  </Typography>
                  {(isConsultant || isCounselor) && stats.monthlyActivity && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>월별 세션 수</Typography>
                      {stats.monthlyActivity.map((m, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 40 }}>{m.month}</Typography>
                          <LinearProgress variant="determinate" value={(m.sessions / 25) * 100}
                            sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                          <Typography variant="body2" fontWeight={600} sx={{ minWidth: 30 }}>{m.sessions}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const UserManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showSuccess } = useNotification();
  const { isAdmin } = useAuth();

  const [users, setUsers] = useState(INITIAL_USERS);

  // Load registered users from Supabase (shared across all browsers)
  useEffect(() => {
    const loadRegisteredUsers = async () => {
      try {
        const { data: row } = await supabase.from('site_config').select('value').eq('key', 'registered_users').single();
        const registered = row?.value || [];
        if (registered.length > 0) {
          const registeredMapped = registered.map((u) => ({
            id: u.id || Date.now() + Math.random(),
            name_ko: u.name_ko || '',
            name_en: u.name_en || '',
            email: u.email,
            role: u.role || 'learner',
            status: 'active',
            department: u.department || '',
            phone: u.phone || '',
            created_at: u.created_at || '-',
            last_login: '-',
            retirement_date: '', birth_date: '', address: '',
            skills: '', bio: '신규 가입 회원',
          }));
          const existingEmails = new Set(INITIAL_USERS.map((u) => u.email));
          const newUsers = registeredMapped.filter((u) => !existingEmails.has(u.email));
          if (newUsers.length > 0) {
            setUsers((prev) => {
              const prevEmails = new Set(prev.map((u) => u.email));
              const toAdd = newUsers.filter((u) => !prevEmails.has(u.email));
              return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
            });
          }
        }
      } catch { /* ignore */ }
    };
    loadRegisteredUsers();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  const [form, setForm] = useState({
    name_ko: '', name_en: '', email: '', role: 'learner', department: '', phone: '',
    status: 'active', birth_date: '', retirement_date: '', address: '', skills: '', bio: '',
  });

  const getRoleLabel = (role) => ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
  const getRoleColor = (role) => {
    const colors = { learner: 'default', consultant: 'info', hr_manager: 'warning', admin: 'error' };
    return colors[role] || 'default';
  };
  const getStatusColor = (status) => {
    const colors = { active: 'success', inactive: 'default', suspended: 'error' };
    return colors[status] || 'default';
  };
  const getStatusLabel = (status) => {
    const labels = { active: '활성', inactive: '비활성', suspended: '정지' };
    return labels[status] || status;
  };

  const filtered = users.filter((u) => {
    const matchSearch = !searchTerm || u.name_ko.includes(searchTerm) || u.email.includes(searchTerm);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleMenuOpen = (e, user) => { setAnchorEl(e.currentTarget); setSelectedUser(user); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const handleAddNew = () => {
    setEditMode(false);
    setForm({ name_ko: '', name_en: '', email: '', role: 'learner', department: '', phone: '', status: 'active', birth_date: '', retirement_date: '', address: '', skills: '', bio: '' });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setEditMode(true);
    setForm({
      name_ko: selectedUser.name_ko, name_en: selectedUser.name_en || '', email: selectedUser.email,
      role: selectedUser.role, department: selectedUser.department || '', phone: selectedUser.phone || '',
      status: selectedUser.status, birth_date: selectedUser.birth_date || '', retirement_date: selectedUser.retirement_date || '',
      address: selectedUser.address || '', skills: selectedUser.skills || '', bio: selectedUser.bio || '',
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleSave = () => {
    if (!form.name_ko.trim() || !form.email.trim()) return;
    if (editMode && selectedUser) {
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, ...form } : u));
      showSuccess('사용자 정보가 수정되었습니다');
    } else {
      const newId = Math.max(0, ...users.map((u) => u.id)) + 1;
      setUsers((prev) => [...prev, {
        id: newId, ...form,
        created_at: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
        last_login: '-',
      }]);
      showSuccess('새 사용자가 등록되었습니다');
    }
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
    setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, status: newStatus } : u));
    showSuccess(`회원 상태가 "${getStatusLabel(newStatus)}"(으)로 변경되었습니다`);
    handleMenuClose();
  };

  const handleDelete = () => { setDeleteConfirmOpen(true); handleMenuClose(); };
  const confirmDelete = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    showSuccess('사용자가 삭제되었습니다');
    setDeleteConfirmOpen(false);
    setSelectedUser(null);
  };

  const handleDetail = (user) => {
    setDetailUser(user);
    setDetailOpen(true);
    handleMenuClose();
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>사용자 관리</Typography>
          <Typography variant="body2" color="text.secondary">플랫폼 회원을 관리합니다 ({filtered.length}명)</Typography>
        </Box>
        {isAdmin() && (
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleAddNew}>
            새 사용자 등록
          </Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
          <TextField fullWidth placeholder="이름, 이메일로 검색..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            size="small" />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>역할 필터</InputLabel>
            <Select value={roleFilter} label="역할 필터" onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="all">전체</MenuItem>
              {ROLE_OPTIONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {isMobile ? (
          <Box>
            {filtered.map((user) => (
              <Box key={user.id} sx={{ p: 2, mb: 1.5, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#0047BA', fontSize: '0.85rem' }}>{user.name_ko.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{user.name_ko}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}><MoreVertIcon fontSize="small" /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip label={getRoleLabel(user.role)} size="small" color={getRoleColor(user.role)} variant="outlined" />
                  <Chip label={getStatusLabel(user.status)} size="small" color={getStatusColor(user.status)} />
                  {user.department && <Chip label={user.department} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">가입: {user.created_at}</Typography>
                  <Button size="small" variant="outlined" sx={{ minWidth: 'auto', px: 1.5, fontSize: '0.75rem' }} onClick={() => handleDetail(user)}>상세</Button>
                </Box>
              </Box>
            ))}
            {filtered.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">검색 결과가 없습니다</Typography></Box>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>사용자</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell align="center">역할</TableCell>
                  <TableCell align="center">부서</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center">가입일</TableCell>
                  <TableCell align="center">최근 로그인</TableCell>
                  <TableCell align="center" width={100}>관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#0047BA', fontSize: '0.8rem' }}>
                          {user.name_ko.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>{user.name_ko}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{user.email}</Typography></TableCell>
                    <TableCell align="center">
                      <Chip label={getRoleLabel(user.role)} size="small" color={getRoleColor(user.role)} variant="outlined" />
                    </TableCell>
                    <TableCell align="center"><Typography variant="body2">{user.department}</Typography></TableCell>
                    <TableCell align="center">
                      <Chip label={getStatusLabel(user.status)} size="small" color={getStatusColor(user.status)} />
                    </TableCell>
                    <TableCell align="center"><Typography variant="body2">{user.created_at}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2">{user.last_login}</Typography></TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Button size="small" variant="outlined" sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}
                          onClick={() => handleDetail(user)}>
                          상세
                        </Button>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">검색 결과가 없습니다</Typography>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '8px', minWidth: 160 } }}>
        <MenuItem onClick={() => { handleDetail(selectedUser); handleMenuClose(); }}>
          <DetailIcon fontSize="small" sx={{ mr: 1 }} />상세보기
        </MenuItem>
        <MenuItem onClick={handleEdit}><EditIcon fontSize="small" sx={{ mr: 1 }} />수정</MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedUser?.status === 'active'
            ? <><BlockIcon fontSize="small" sx={{ mr: 1 }} />계정 정지</>
            : <><ActiveIcon fontSize="small" sx={{ mr: 1 }} />계정 활성화</>}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />삭제
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog (extended fields) */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle fontWeight={700}>{editMode ? '사용자 수정' : '새 사용자 등록'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="이름 (한국어)" value={form.name_ko} required
                onChange={(e) => setForm({ ...form, name_ko: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="이름 (영문)" value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="이메일" value={form.email} required
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="연락처" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>역할</InputLabel>
                <Select value={form.role} label="역할" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLE_OPTIONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select value={form.status} label="상태" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="active">활성</MenuItem>
                  <MenuItem value="inactive">비활성</MenuItem>
                  <MenuItem value="suspended">정지</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="부서" value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="생년월일" placeholder="YYYY.MM.DD" value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="퇴직일" placeholder="YYYY.MM.DD" value={form.retirement_date}
                onChange={(e) => setForm({ ...form, retirement_date: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="주소" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="보유 스킬" placeholder="금융상담, 자산관리, ..." value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="소개 / 메모" multiline rows={2} value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name_ko.trim() || !form.email.trim()}>
            {editMode ? '수정' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle fontWeight={700}>사용자 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{selectedUser?.name_ko}" 사용자를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>삭제</Button>
        </DialogActions>
      </Dialog>

      {/* User Detail Stats Dialog */}
      <UserDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} user={detailUser} />
    </Box>
  );
};

export default UserManagement;
