import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Avatar, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, alpha, useMediaQuery, useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  SupportAgent as ConsultIcon,
  Assignment as ProgramIcon,
  PendingActions as PendingIcon,
  Videocam as OnlineIcon,
  LocationOn as OfflineIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowIcon,
  HowToReg as ApprovalIcon,
} from '@mui/icons-material';
import { loadPrograms, loadApplications } from '../../utils/programStore';
import {
  getConsultationStats, getConsultantStats, CONSULTANTS, loadConsultants, loadBookings,
} from '../../utils/consultationStore';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

const methodIcon = { '온라인': <OnlineIcon sx={{ fontSize: 14 }} />, '오프라인': <OfflineIcon sx={{ fontSize: 14 }} />, '전화': <PhoneIcon sx={{ fontSize: 14 }} /> };
const statusLabels = { pending: '배정대기', pending_approval: '승인대기', proposed: '상담제안', confirmed: '확정', completed: '완료', rejected: '거절' };
const statusConfig = {
  '승인대기': { color: '#92400E', bg: '#FEF3C7' }, '승인': { color: '#166534', bg: '#DCFCE7' },
  '반려': { color: '#991B1B', bg: '#FEE2E2' }, pending: { color: '#92400E', bg: '#FEF3C7' },
  pending_approval: { color: '#7C3AED', bg: '#F3F0FF' },
  proposed: { color: '#0369A1', bg: '#E0F2FE' },
  confirmed: { color: '#1E40AF', bg: '#DBEAFE' }, completed: { color: '#166534', bg: '#DCFCE7' },
  rejected: { color: '#C62828', bg: '#FFEBEE' },
};

const DashCard = ({ title, action, children, sx = {}, isMobile }) => (
  <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
    {title && (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant={isMobile ? 'body1' : 'subtitle1'} sx={{ fontWeight: 700 }}>{title}</Typography>
        {action}
      </Box>
    )}
    <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
  </Paper>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isConsultantRole = user?.role === 'consultant';

  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [consultStats, setConsultStats] = useState({});
  const [consultantStats, setConsultantStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const loadAsync = async () => {
      await loadConsultants();
      const [progs, apps, cs, cas, bk] = await Promise.all([
        loadPrograms(),
        loadApplications(),
        getConsultationStats(),
        getConsultantStats(),
        loadBookings(),
      ]);
      setPrograms(progs);
      setApplications(apps);
      setConsultStats(cs);
      setConsultantStats(cas);
      setBookings(bk);
      // Count registered learners from Supabase users table
      try {
        const { count } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'learner').eq('status', 'active');
        setUserCount(count || 0);
      } catch { setUserCount(0); }
    };
    loadAsync();
    const interval = setInterval(loadAsync, 5000);
    return () => clearInterval(interval);
  }, []);

  // Instructor-specific data
  const myBookings = isConsultantRole
    ? bookings.filter((b) => b.consultantId === user.id && b.status !== 'cancelled')
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
    : [];
  const myPendingApproval = myBookings.filter((b) => b.status === 'pending_approval').length;
  const myConfirmed = myBookings.filter((b) => b.status === 'confirmed').length;
  const myCompleted = myBookings.filter((b) => b.status === 'completed').length;

  const activePrograms = programs.filter((p) => p.status !== '종료').length;
  const pendingApprovals = applications.filter((a) => a.status === '승인대기').length;

  // ─── INSTRUCTOR DASHBOARD ───
  if (isConsultantRole) {
    return (
      <Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700}>상담 대시보드</Typography>
          <Typography variant="body2" color="text.secondary">{user.name_ko} 강사님의 상담 현황</Typography>
        </Box>

        {/* KPI - always 2 cols on mobile, 4 on desktop */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[
            { label: '승인 대기', value: myPendingApproval, color: '#7C3AED', bg: '#F3F0FF', icon: <ApprovalIcon /> },
            { label: '확정', value: myConfirmed, color: '#1E40AF', bg: '#DBEAFE', icon: <ConsultIcon /> },
            { label: '완료', value: myCompleted, color: '#166534', bg: '#DCFCE7', icon: <ProgramIcon /> },
            { label: '전체 배정', value: new Set(myBookings.map((b) => b.userId)).size, color: '#0047BA', bg: '#EBF0FA', icon: <PeopleIcon /> },
          ].map((kpi) => (
            <Grid item xs={6} md={3} key={kpi.label}>
              <Paper
                elevation={0}
                onClick={() => navigate('/admin/consultations')}
                sx={{
                  p: { xs: 1.5, md: 2.5 }, borderRadius: '12px', border: '1px solid', borderColor: 'divider',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                  '&:hover': { borderColor: kpi.color, boxShadow: `0 4px 12px ${alpha(kpi.color, 0.15)}` },
                }}
              >
                <Avatar sx={{ width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 }, bgcolor: kpi.bg, color: kpi.color, flexShrink: 0 }}>
                  {React.cloneElement(kpi.icon, { fontSize: 'small' })}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, lineHeight: 1.2 }}>{kpi.value}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{kpi.label}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Pending approvals */}
        {myPendingApproval > 0 && (
          <Box sx={{ mb: 2 }}>
            <DashCard isMobile={isMobile} title={`승인 대기 (${myPendingApproval}건)`} action={
              <Chip label="상담 관리" size="small" onClick={() => navigate('/admin/consultations')} sx={{ cursor: 'pointer' }} />
            }>
              {isMobile ? (
                <Box>
                  {myBookings.filter((b) => b.status === 'pending_approval').map((b) => (
                    <Box key={b.id} sx={{ p: 1.5, mb: 1, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#FAFAFA', cursor: 'pointer' }} onClick={() => navigate('/admin/consultations')}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{b.userName}</Typography>
                        <Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 22 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">{b.date} {b.time}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>사용자</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>날짜/시간</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>방법</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myBookings.filter((b) => b.status === 'pending_approval').map((b) => (
                        <TableRow key={b.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/consultations')}>
                          <TableCell><Typography variant="body2" fontWeight={500}>{b.userName}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{b.date} {b.time}</Typography></TableCell>
                          <TableCell><Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 22 }} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DashCard>
          </Box>
        )}

        {/* My recent bookings */}
        <DashCard isMobile={isMobile} title="나의 상담 내역" action={
          <Chip label="전체 보기" size="small" onClick={() => navigate('/admin/consultations')} sx={{ cursor: 'pointer' }} />
        }>
          {isMobile ? (
            <Box>
              {myBookings.slice(0, 8).map((b) => {
                const s = statusConfig[b.status] || { label: b.status, color: '#666', bg: '#F3F4F6' };
                return (
                  <Box key={b.id} sx={{ p: 1.5, mb: 1, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#FAFAFA' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#0047BA', flexShrink: 0 }}>{b.userName?.charAt(0)}</Avatar>
                        <Typography variant="body2" fontWeight={600} noWrap>{b.userName}</Typography>
                      </Box>
                      <Chip label={statusLabels[b.status] || b.status} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600, flexShrink: 0, ml: 1 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{b.date} {b.time}</Typography>
                      <Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                    </Box>
                  </Box>
                );
              })}
              {myBookings.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">상담 내역이 없습니다</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>사용자</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>날짜/시간</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>방법</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myBookings.slice(0, 8).map((b) => {
                    const s = statusConfig[b.status] || { label: b.status, color: '#666', bg: '#F3F4F6' };
                    return (
                      <TableRow key={b.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#0047BA' }}>{b.userName?.charAt(0)}</Avatar>
                            <Typography variant="body2">{b.userName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell><Typography variant="body2">{b.date} {b.time}</Typography></TableCell>
                        <TableCell><Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 22 }} /></TableCell>
                        <TableCell align="center">
                          <Chip label={statusLabels[b.status] || b.status} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600 }} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DashCard>
      </Box>
    );
  }

  // ─── ADMIN DASHBOARD ───
  const kpiData = [
    { label: '등록 사용자', value: userCount, icon: <PeopleIcon />, color: '#0047BA', bg: '#EBF0FA' },
    { label: '활성 프로그램', value: activePrograms, icon: <ProgramIcon />, color: '#059669', bg: '#ECFDF5' },
    { label: '전체 상담', value: consultStats.total, icon: <ConsultIcon />, color: '#7C3AED', bg: '#F3F0FF' },
    { label: '미처리', value: pendingApprovals + consultStats.pending, icon: <PendingIcon />, color: '#DC2626', bg: '#FEF2F2' },
  ];

  const pipelineData = [
    { stage: '프로그램 승인대기', count: pendingApprovals, color: '#F59E0B', bg: '#FFF7ED', link: '/admin/programs' },
    { stage: '상담 배정대기', count: consultStats.pending, color: '#0047BA', bg: '#EBF0FA', link: '/admin/consultations' },
    { stage: '강사 승인대기', count: consultStats.pending_approval, color: '#7C3AED', bg: '#F3F0FF', link: '/admin/consultations' },
    { stage: '상담 완료', count: consultStats.completed, color: '#166534', bg: '#DCFCE7', link: '/admin/consultations' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700}>관리자 대시보드</Typography>
        <Typography variant="body2" color="text.secondary">플랫폼 현황을 한 눈에 확인합니다</Typography>
      </Box>

      {/* KPI cards — horizontal layout on mobile with icon + text side by side */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {kpiData.map((kpi) => (
          <Grid item xs={6} md={3} key={kpi.label}>
            <Paper elevation={0} sx={{
              p: { xs: 1.5, md: 2.5 }, borderRadius: '12px', border: '1px solid', borderColor: 'divider',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
              '&:hover': { borderColor: kpi.color, boxShadow: `0 4px 12px ${alpha(kpi.color, 0.15)}` },
            }} onClick={() => navigate(kpi.label.includes('프로그램') ? '/admin/programs' : '/admin/consultations')}>
              <Avatar sx={{ width: { xs: 36, md: 44 }, height: { xs: 36, md: 44 }, bgcolor: kpi.bg, color: kpi.color, flexShrink: 0 }}>
                {React.cloneElement(kpi.icon, { fontSize: 'small' })}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, lineHeight: 1.2 }}>{kpi.value}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>{kpi.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Pipeline */}
      <Box sx={{ mb: 2 }}>
        <DashCard isMobile={isMobile} title="처리 현황">
          <Grid container spacing={1.5}>
            {pipelineData.map((stage, i) => (
              <Grid item xs={6} md={3} key={stage.stage}>
                <Paper elevation={0} sx={{
                  p: { xs: 1.5, md: 2.5 }, borderRadius: '10px', bgcolor: stage.bg,
                  border: `1px solid ${alpha(stage.color, 0.2)}`, cursor: 'pointer', position: 'relative',
                  '&:hover': { boxShadow: `0 4px 12px ${alpha(stage.color, 0.2)}` },
                }} onClick={() => navigate(stage.link)}>
                  {i < pipelineData.length - 1 && (
                    <ArrowIcon sx={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', color: '#D1D5DB', fontSize: 20, display: { xs: 'none', md: 'block' }, zIndex: 1 }} />
                  )}
                  <Typography variant="caption" sx={{ color: stage.color, fontWeight: 600 }} noWrap>{stage.stage}</Typography>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, color: stage.color, mt: 0.5 }}>{stage.count}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DashCard>
      </Box>

      {/* Consultant + Program status */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <DashCard isMobile={isMobile} title="상담사 현황" action={<Chip label="상세" size="small" onClick={() => navigate('/admin/consultations')} sx={{ cursor: 'pointer' }} />}>
            {CONSULTANTS.map((c) => {
              const cs = consultantStats[c.id] || {};
              return (
                <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                  <Avatar sx={{ bgcolor: '#0047BA', width: { xs: 28, md: 36 }, height: { xs: 28, md: 36 }, fontSize: '0.8rem', flexShrink: 0 }}>{c.name_ko.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{c.name_ko}</Typography>
                    {!isMobile && <Typography variant="caption" color="text.secondary">{c.department}</Typography>}
                  </Box>
                  <Box sx={{ display: 'flex', gap: { xs: 1, md: 1.5 }, flexShrink: 0 }}>
                    {[{ v: cs.total || 0, l: '전체', c: 'primary' }, { v: cs.completed || 0, l: '완료', c: 'success.main' }, { v: cs.confirmed || 0, l: '확정', c: 'info.main' }].map((x) => (
                      <Box key={x.l} sx={{ textAlign: 'center', minWidth: { xs: 28, md: 36 } }}>
                        <Typography variant="body2" fontWeight={700} color={x.c}>{x.v}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{x.l}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </DashCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashCard isMobile={isMobile} title="프로그램 현황" action={<Chip label="상세" size="small" onClick={() => navigate('/admin/programs')} sx={{ cursor: 'pointer' }} />}>
            {programs.slice(0, 5).map((p) => {
              const appCount = applications.filter((a) => String(a.programId) === String(p.id) && a.status !== '취소' && a.status !== '반려').length;
              const sc = { '모집중': '#059669', '마감예정': '#EA580C', '진행중': '#0047BA', '종료': '#9CA3AF' };
              return (
                <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>{p.title_ko}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{p.start_date} ~ {p.end_date}</Typography>
                  </Box>
                  <Chip label={p.status} size="small" sx={{ bgcolor: alpha(sc[p.status] || '#666', 0.1), color: sc[p.status], fontWeight: 600, height: 22, fontSize: '0.65rem', flexShrink: 0 }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ flexShrink: 0 }}>{appCount}/{p.capacity}</Typography>
                </Box>
              );
            })}
          </DashCard>
        </Grid>
      </Grid>

      {/* Recent tables */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <DashCard isMobile={isMobile} title="최근 프로그램 신청">
            {isMobile ? (
              <Box>
                {applications.slice(0, 6).map((a) => {
                  const s = statusConfig[a.status];
                  return (
                    <Box key={a.id} sx={{ p: 1.5, mb: 1, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#FAFAFA', cursor: 'pointer' }} onClick={() => navigate('/admin/programs')}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                          <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: '#0047BA', flexShrink: 0 }}>{a.user_name?.charAt(0)}</Avatar>
                          <Typography variant="body2" fontWeight={600} noWrap>{a.user_name}</Typography>
                        </Box>
                        <Chip label={a.status} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600, flexShrink: 0, ml: 1 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{a.program_title}</Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>{a.applied_at}</Typography>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <TableContainer><Table size="small"><TableHead><TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>신청자</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>프로그램</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>신청일</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }} align="center">상태</TableCell>
              </TableRow></TableHead><TableBody>
                {applications.slice(0, 6).map((a) => {
                  const s = statusConfig[a.status];
                  return (
                    <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/programs')}>
                      <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#0047BA' }}>{a.user_name?.charAt(0)}</Avatar><Typography variant="body2" fontSize="0.8rem">{a.user_name}</Typography></Box></TableCell>
                      <TableCell><Typography variant="body2" fontSize="0.8rem" noWrap sx={{ maxWidth: 160 }}>{a.program_title}</Typography></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{a.applied_at}</Typography></TableCell>
                      <TableCell align="center"><Chip label={a.status} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600 }} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody></Table></TableContainer>
            )}
          </DashCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashCard isMobile={isMobile} title="최근 상담 예약">
            {isMobile ? (
              <Box>
                {bookings.filter((b) => b.status !== 'cancelled').slice(0, 6).map((b) => {
                  const s = statusConfig[b.status] || { label: b.status, color: '#666', bg: '#F3F4F6' };
                  return (
                    <Box key={b.id} sx={{ p: 1.5, mb: 1, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#FAFAFA', cursor: 'pointer' }} onClick={() => navigate('/admin/consultations')}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                          <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: '#0047BA', flexShrink: 0 }}>{b.userName?.charAt(0)}</Avatar>
                          <Typography variant="body2" fontWeight={600} noWrap>{b.userName}</Typography>
                        </Box>
                        <Chip label={statusLabels[b.status] || b.status} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600, flexShrink: 0, ml: 1 }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">{b.date} {b.time}</Typography>
                        <Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
                      </Box>
                      {b.consultantName && <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>강사: {b.consultantName}</Typography>}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <TableContainer><Table size="small"><TableHead><TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>사용자</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>날짜/시간</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>방법</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>강사</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }} align="center">상태</TableCell>
              </TableRow></TableHead><TableBody>
                {bookings.filter((b) => b.status !== 'cancelled').slice(0, 6).map((b) => {
                  const s = statusConfig[b.status] || { label: b.status, color: '#666', bg: '#F3F4F6' };
                  return (
                    <TableRow key={b.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/consultations')}>
                      <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#0047BA' }}>{b.userName?.charAt(0)}</Avatar><Typography variant="body2" fontSize="0.8rem">{b.userName}</Typography></Box></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{b.date} {b.time}</Typography></TableCell>
                      <TableCell><Chip icon={methodIcon[b.method]} label={b.method} size="small" sx={{ height: 20, fontSize: '0.65rem' }} /></TableCell>
                      <TableCell><Typography variant="body2" fontSize="0.8rem">{b.consultantName || '-'}</Typography></TableCell>
                      <TableCell align="center"><Chip label={statusLabels[b.status] || b.status} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: s?.bg, color: s?.color, fontWeight: 600 }} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody></Table></TableContainer>
            )}
          </DashCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
