import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { programsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const ProgramManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tab, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const response = await programsAPI.getAll({ page });
        setPrograms(response.data.programs || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        const response = await programsAPI.getApplications({ page, status: 'pending' });
        setApplications(response.data.applications || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockPrograms = [
    { id: 1, title_ko: '금융컨설팅 전문가 과정', category: '금융', status: '모집중', start_date: '2024.06.01', end_date: '2024.08.31', applicants: 45 },
    { id: 2, title_ko: '부동산 투자 전략', category: '부동산', status: '마감예정', start_date: '2024.06.15', end_date: '2024.07.15', applicants: 32 },
    { id: 3, title_ko: '시니어 창업 아카데미', category: '창업', status: '모집중', start_date: '2024.07.01', end_date: '2024.09.30', applicants: 28 },
    { id: 4, title_ko: '사회공헌 봉사단', category: '사회공헌', status: '진행중', start_date: '2024.05.01', end_date: '2024.12.31', applicants: 56 },
    { id: 5, title_ko: '디지털 금융 활용', category: '금융', status: '종료', start_date: '2024.03.01', end_date: '2024.04.30', applicants: 40 },
  ];

  const mockApplications = [
    { id: 1, user_name: '홍길동', program_title: '금융컨설팅 전문가 과정', applied_at: '2024.05.20', status: '승인대기' },
    { id: 2, user_name: '김영희', program_title: '부동산 투자 전략', applied_at: '2024.05.19', status: '승인대기' },
    { id: 3, user_name: '이철수', program_title: '시니어 창업 아카데미', applied_at: '2024.05.18', status: '승인대기' },
    { id: 4, user_name: '박민수', program_title: '금융컨설팅 전문가 과정', applied_at: '2024.05.17', status: '승인대기' },
    { id: 5, user_name: '정수연', program_title: '사회공헌 봉사단', applied_at: '2024.05.16', status: '승인대기' },
  ];

  const displayPrograms = programs.length > 0 ? programs : mockPrograms;
  const displayApplications = applications.length > 0 ? applications : mockApplications;

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    try {
      await programsAPI.updateApplicationStatus(selectedItem.id, 'approved');
      showSuccess('신청이 승인되었습니다');
      fetchData();
    } catch (error) {
      showError('승인 처리에 실패했습니다');
    }
    handleMenuClose();
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    try {
      await programsAPI.updateApplicationStatus(selectedItem.id, 'rejected');
      showSuccess('신청이 반려되었습니다');
      fetchData();
    } catch (error) {
      showError('반려 처리에 실패했습니다');
    }
    handleMenuClose();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            {t('admin.programManagement')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            프로그램 및 신청을 관리합니다
          </Typography>
        </Box>
        {tab === 0 && (
          <Button variant="contained" startIcon={<AddIcon />}>
            새 프로그램 등록
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(e, v) => { setTab(v); setPage(1); }}
            sx={{ mb: 3, borderBottom: '1px solid #E5E5E5' }}
          >
            <Tab label="프로그램 목록" />
            <Tab label="신청 승인 관리" />
          </Tabs>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {/* Content */}
          {loading ? (
            <Box>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : (
            <>
              {/* Programs Table */}
              {tab === 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>프로그램명</TableCell>
                        <TableCell align="center">분야</TableCell>
                        <TableCell align="center">상태</TableCell>
                        <TableCell align="center">기간</TableCell>
                        <TableCell align="center">신청자</TableCell>
                        <TableCell align="center">관리</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayPrograms.map((program) => (
                        <TableRow key={program.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {program.title_ko}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <CategoryBadge category={program.category} />
                          </TableCell>
                          <TableCell align="center">
                            <StatusBadge status={program.status} />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {program.start_date} ~ {program.end_date}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{program.applicants}명</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, program)}>
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Applications Table */}
              {tab === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>신청자</TableCell>
                        <TableCell>프로그램</TableCell>
                        <TableCell align="center">신청일</TableCell>
                        <TableCell align="center">상태</TableCell>
                        <TableCell align="center">처리</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayApplications.map((app) => (
                        <TableRow key={app.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {app.user_name}
                            </Typography>
                          </TableCell>
                          <TableCell>{app.program_title}</TableCell>
                          <TableCell align="center">{app.applied_at}</TableCell>
                          <TableCell align="center">
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => { setSelectedItem(app); handleApprove(); }}
                              >
                                승인
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => { setSelectedItem(app); handleReject(); }}
                              >
                                반려
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, v) => setPage(v)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Program Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && tab === 0}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          상세보기
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          수정
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          삭제
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProgramManagement;
