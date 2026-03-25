import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Avatar, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, alpha,
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
  getConsultationStats, getConsultantStats, CONSULTANTS, loadBookings,
} from '../../utils/consultationStore';
import { useAuth, ALL_USERS } from '../../contexts/AuthContext';

const methodIcon = { '온라인': <OnlineIcon sx={{ fontSize: 14 }} />, '오프라인': <OfflineIcon sx={{ fontSize: 14 }} />, '전화': <PhoneIcon sx={{ fontSize: 14 }} /> };
const statusLabels = { pending: '배정대기', pending_approval: '승인대기', confirmed: '확정', completed: '완료' };
const statusConfig = {
  '승인대기': { color: '#92400E', bg: '#FEF3C7' }, '승인': { color: '#166534', bg: '#DCFCE7' },
  '반려': { color: '#991B1B', bg: '#FEE2E2' }, pending: { color: '#92400E', bg: '#FEF3C7' },
  pending_approval: { color: '#7C3AED', bg: '#F3F0FF' },
  confirmed: { color: '#1E40AF', bg: '#DBEAFE' }, completed: { color: '#166534', bg: '#DCFCE7' },
};

const DashCard = ({ title, action, children, sx = {} }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
    {title && (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
        {action}
      </Box>
    )}
    <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
  </Paper>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isConsultantRole = user?.role === 'consultant';

  const programs = useMemo(() => loadPrograms(), []);
  const applications = useMemo(() => loadApplications(), []);

  const [consultStats, setConsultStats] = useState({});
  const [consultantStats, setConsultantStats] = useState({});
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadAsync = async () => {
      const [cs, cas, bk] = await Promise.all([
        getConsultationStats(),
        getConsultantStats(),
        loadBookings(),
      ]);
      setConsultStats(cs);
      setConsultantStats(cas);
      setBookings(bk);
    };
    loadAsync();
  }, []);
  const userCount = Object.values(ALL_USERS).filter((u) => u.role === 'learner').length;

  // Instructor-specific data
  const myBookings = isConsultantRole
    ? bookings.filter((b) => b.consultantId === user.id && b.status !== 'cancelled')
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>상담 대시보드</Typography>
          <Typography variant="body2" color="text.secondary">{user.name_ko} 강사님의 상담 현황</Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: '승인 대기', value: myPendingApproval, color: '#7C3AED', bg: '#F3F0FF', icon: <ApprovalIcon /> },
            { label: '확정', value: myConfirmed, color: '#1E40AF', bg: '#DBEAFE', icon: <ConsultIcon /> },
            { label: '완료', value: myCompleted, color: '#166534', bg: '#DCFCE7', icon: <ProgramIcon /> },
            { label: '전체 배정', value: myBookings.length, color: '#0047BA', bg: '#EBF0FA', icon: <PeopleIcon /> },
          ].map((kpi) => (
            <Grid item xs={6} sm={3} key={kpi.label}>
              <Paper
                elevation={0}
                onClick={() => navigate('/admin/consultations')}
                sx={{
                  p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider',
                  cursor: 'pointer', '&:hover': { borderColor: kpi.color, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(kpi.color, 0.15)}` },
                }}
              >
                <Avatar sx={{ width: 40, height: 40, bgcolor: kpi.bg, color: kpi.color, mb: 1.5 }}>
                  {React.cloneElement(kpi.icon, { fontSize: 'small' })}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{kpi.value}</Typography>
                <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Pending approvals */}
        {myPendingApproval > 0 && (
          <Box sx={{ mb: 3 }}>
            <DashCard title={`승인 대기 중인 상담 (${myPendingApproval}건)`} action={
              <Chip label="상담 관리" size="small" onClick={() => navigate('/admin/consultations')} sx={{ cursor: 'pointer' }} />
            }>
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
            </DashCard>
          </Box>
        )}

        {/* My recent bookings */}
        <DashCard title="나의 상담 내역" action={
          <Chip label="전체 보기" size="small" onClick={() => navigate('/admin/consultations')} sx={{ cursor: 'pointer' }} />
        }>
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
                  const s = statusConfig[b.status];
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>관리자 대시보드</Typography>
        <Typography variant="body2" color="text.secondary">플랫폼 현황을 한 눈에 확인합니다</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiData.map((kpi) => (
          <Grid item xs={6} sm={3} key={kpi.label}>
            <Paper elevation={0} sx={{
              p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider',
              cursor: 'pointer', '&:hover': { borderColor: kpi.color, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(kpi.color, 0.15)}` },
            }} onClick={() => navigate(kpi.label.includes('프로그램') ? '/admin/programs' : '/admin/consultations')}>
              <Avatar sx={{ width: 44, height: 44, bgcolor: kpi.bg, color: kpi.color, mb: 1.5 }}>
                {React.cloneElement(kpi.icon, { fontSize: 'small' })}
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.25 }}>{kpi.value}</Typography>
              <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 3 }}>
        <DashCard title="처리 현황">
          <Grid container spacing={2}>
            {pipelineData.map((stage, i) => (
              <Grid item xs={6} sm={3} key={stage.stage}>
                <Paper elevation={0} sx={{
                  p: 2.5, borderRadius: '10px', bgcolor: stage.bg,
                  border: `1px solid ${alpha(stage.color, 0.2)}`, cursor: 'pointer', position: 'relative',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(stage.color, 0.2)}` },
                }} onClick={() => navigate(stage.link)}>
                  {i < pipelineData.length - 1 && (
                    <ArrowIcon sx={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', color: '#D1D5DB', fontSize: 20, display: { xs: 'none', sm: 'block' }, zIndex: 1 }} />
                  )}
                  <Typography variant="caption" sx={{ color: stage.color, fontWeight: 600 }}>{stage.stage}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: stage.color, mt: 0.5 }}>{stage.count}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DashCard>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <DashCard title="상담사 현황" action={<Chip label="상세 보기" size="small" onClick={() => navigate('/admin/consultations')} sx={{ cursor: 'pointer' }} />}>
            {CONSULTANTS.map((c) => {
              const cs = consultantStats[c.id] || {};
              return (
                <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                  <Avatar sx={{ bgcolor: '#0047BA', width: 36, height: 36, fontSize: '0.85rem' }}>{c.name_ko.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{c.name_ko}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.department}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {[{ v: cs.total || 0, l: '전체', c: 'primary' }, { v: cs.completed || 0, l: '완료', c: 'success.main' }, { v: cs.confirmed || 0, l: '확정', c: 'info.main' }].map((x) => (
                      <Box key={x.l} sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={700} color={x.c}>{x.v}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{x.l}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </DashCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashCard title="프로그램 현황" action={<Chip label="상세 보기" size="small" onClick={() => navigate('/admin/programs')} sx={{ cursor: 'pointer' }} />}>
            {programs.slice(0, 5).map((p) => {
              const appCount = applications.filter((a) => String(a.programId) === String(p.id) && a.status !== '취소' && a.status !== '반려').length;
              const sc = { '모집중': '#059669', '마감예정': '#EA580C', '진행중': '#0047BA', '종료': '#9CA3AF' };
              return (
                <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{p.title_ko}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.start_date} ~ {p.end_date}</Typography>
                  </Box>
                  <Chip label={p.status} size="small" sx={{ bgcolor: alpha(sc[p.status] || '#666', 0.1), color: sc[p.status], fontWeight: 600, height: 22, fontSize: '0.7rem' }} />
                  <Typography variant="body2" fontWeight={600} color="text.secondary">{Math.max(p.applicants || 0, appCount)}/{p.capacity}</Typography>
                </Box>
              );
            })}
          </DashCard>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <DashCard title="최근 프로그램 신청">
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
          </DashCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashCard title="최근 상담 예약">
            <TableContainer><Table size="small"><TableHead><TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>사용자</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>날짜/시간</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>방법</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>강사</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }} align="center">상태</TableCell>
            </TableRow></TableHead><TableBody>
              {bookings.filter((b) => b.status !== 'cancelled').slice(0, 6).map((b) => {
                const s = statusConfig[b.status];
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
          </DashCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
