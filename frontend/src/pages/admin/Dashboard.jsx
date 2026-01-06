import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { dashboardAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <TrendingUpIcon fontSize="small" color="success" />
              <Typography variant="caption" color="success.main">
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ color }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardAPI.getAdminStats();
        setStats(response.data.stats);
        setRecentApplications(response.data.recentApplications || []);
        setRecentInquiries(response.data.recentInquiries || []);
      } catch (error) {
        console.error('Failed to fetch admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data
  const mockStats = {
    totalUsers: 487,
    activePrograms: 12,
    activeJobs: 28,
    onlineCourses: 15,
    pendingApplications: 23,
    pendingInquiries: 8,
  };

  const mockRecentApplications = [
    { id: 1, user_name: '홍길동', program_title: '금융컨설팅 전문가 과정', date: '2024.05.20', status: '승인대기' },
    { id: 2, user_name: '김영희', program_title: '부동산 투자 전략', date: '2024.05.19', status: '승인완료' },
    { id: 3, user_name: '이철수', program_title: '시니어 창업 아카데미', date: '2024.05.18', status: '승인대기' },
    { id: 4, user_name: '박민수', program_title: '사회공헌 봉사단', date: '2024.05.17', status: '진행중' },
    { id: 5, user_name: '정수연', program_title: '디지털 금융 활용', date: '2024.05.16', status: '승인완료' },
  ];

  const mockRecentInquiries = [
    { id: 1, user_name: '최지영', title: '프로그램 신청 문의', date: '2024.05.20', status: '대기중' },
    { id: 2, user_name: '강민호', title: '이력서 업로드 오류', date: '2024.05.19', status: '처리중' },
    { id: 3, user_name: '윤서아', title: '수료증 발급 요청', date: '2024.05.18', status: '답변완료' },
  ];

  const displayStats = stats || mockStats;
  const displayApplications = recentApplications.length > 0 ? recentApplications : mockRecentApplications;
  const displayInquiries = recentInquiries.length > 0 ? recentInquiries : mockRecentInquiries;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          {t('admin.dashboard')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          플랫폼 현황을 한눈에 확인하세요
        </Typography>
      </Box>

      {/* Stats Cards */}
      {loading ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="전체 회원"
              value={displayStats.totalUsers?.toLocaleString()}
              icon={PeopleIcon}
              color="#0047BA"
              trend="+12 이번 주"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="진행 중 프로그램"
              value={displayStats.activePrograms}
              icon={AssignmentIcon}
              color="#43A047"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="채용 공고"
              value={displayStats.activeJobs}
              icon={WorkIcon}
              color="#FB8C00"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="온라인 강의"
              value={displayStats.onlineCourses}
              icon={SchoolIcon}
              color="#7B1FA2"
            />
          </Grid>
        </Grid>
      )}

      {/* Alert Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ backgroundColor: '#FFF3E0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    승인 대기 신청
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="warning.dark">
                    {displayStats.pendingApplications}건
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="warning"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/admin/programs')}
                >
                  처리하기
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ backgroundColor: '#E3F2FD' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    미답변 문의
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="info.dark">
                    {displayStats.pendingInquiries}건
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="info"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/admin/inquiries')}
                >
                  답변하기
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Data Tables */}
      <Grid container spacing={3}>
        {/* Recent Applications */}
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  최근 프로그램 신청
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/admin/programs')}
                >
                  전체보기
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>신청자</TableCell>
                      <TableCell>프로그램</TableCell>
                      <TableCell align="center">신청일</TableCell>
                      <TableCell align="center">상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayApplications.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell>{app.user_name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {app.program_title}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{app.date}</TableCell>
                        <TableCell align="center">
                          <StatusBadge status={app.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Inquiries */}
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  최근 문의
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/admin/inquiries')}
                >
                  전체보기
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>문의자</TableCell>
                      <TableCell>제목</TableCell>
                      <TableCell align="center">상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id} hover>
                        <TableCell>{inquiry.user_name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {inquiry.title}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={inquiry.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
