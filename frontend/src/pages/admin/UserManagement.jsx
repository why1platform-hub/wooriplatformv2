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
  Chip,
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
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { usersAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const UserManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({ page, search: searchTerm });
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockUsers = [
    { id: 1, name_ko: '홍길동', email: 'hong@woori.com', role: 'learner', status: 'active', created_at: '2024.01.15', last_login: '2024.05.20' },
    { id: 2, name_ko: '김영희', email: 'kim@woori.com', role: 'learner', status: 'active', created_at: '2024.02.10', last_login: '2024.05.19' },
    { id: 3, name_ko: '이철수', email: 'lee@woori.com', role: 'instructor', status: 'active', created_at: '2024.01.20', last_login: '2024.05.18' },
    { id: 4, name_ko: '박민수', email: 'park@woori.com', role: 'learner', status: 'inactive', created_at: '2024.03.05', last_login: '2024.04.10' },
    { id: 5, name_ko: '정수연', email: 'jung@woori.com', role: 'career_counselor', status: 'active', created_at: '2024.01.25', last_login: '2024.05.20' },
    { id: 6, name_ko: '최지영', email: 'choi@woori.com', role: 'hr_manager', status: 'active', created_at: '2024.01.10', last_login: '2024.05.20' },
    { id: 7, name_ko: '강민호', email: 'kang@woori.com', role: 'learner', status: 'active', created_at: '2024.04.01', last_login: '2024.05.17' },
    { id: 8, name_ko: '윤서아', email: 'yoon@woori.com', role: 'learner', status: 'suspended', created_at: '2024.02.20', last_login: '2024.03.15' },
  ];

  const displayUsers = users.length > 0 ? users : mockUsers;

  const getRoleLabel = (role) => {
    const labels = {
      learner: '학습자',
      instructor: '강사',
      career_counselor: '상담사',
      hr_manager: 'HR 관리자',
      admin: '관리자',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      learner: 'default',
      instructor: 'info',
      career_counselor: 'secondary',
      hr_manager: 'warning',
      admin: 'error',
    };
    return colors[role] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      suspended: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: '활성',
      inactive: '비활성',
      suspended: '정지',
    };
    return labels[status] || status;
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleViewDetail = () => {
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    try {
      const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
      await usersAPI.updateStatus(selectedUser.id, newStatus);
      showSuccess(`회원 상태가 변경되었습니다`);
      fetchUsers();
    } catch (error) {
      showError('상태 변경에 실패했습니다');
    }
    handleMenuClose();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          {t('admin.userManagement')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          플랫폼 회원을 관리합니다
        </Typography>
      </Box>

      <Card>
        <CardContent>
          {/* Search */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="이름, 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Table */}
          {loading ? (
            <Box>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>이름</TableCell>
                      <TableCell>이메일</TableCell>
                      <TableCell align="center">역할</TableCell>
                      <TableCell align="center">상태</TableCell>
                      <TableCell align="center">가입일</TableCell>
                      <TableCell align="center">최근 로그인</TableCell>
                      <TableCell align="center">관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {user.name_ko || user.name_en}
                          </Typography>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getRoleLabel(user.role)}
                            size="small"
                            color={getRoleColor(user.role)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(user.status)}
                            size="small"
                            color={getStatusColor(user.status)}
                          />
                        </TableCell>
                        <TableCell align="center">{user.created_at}</TableCell>
                        <TableCell align="center">{user.last_login}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, user)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetail}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          상세보기
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedUser?.status === 'active' ? (
            <>
              <BlockIcon fontSize="small" sx={{ mr: 1 }} />
              계정 정지
            </>
          ) : (
            <>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
              계정 활성화
            </>
          )}
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>회원 상세 정보</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">이름</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.name_ko}</Typography>

              <Typography variant="subtitle2" color="text.secondary">이메일</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.email}</Typography>

              <Typography variant="subtitle2" color="text.secondary">역할</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{getRoleLabel(selectedUser.role)}</Typography>

              <Typography variant="subtitle2" color="text.secondary">상태</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{getStatusLabel(selectedUser.status)}</Typography>

              <Typography variant="subtitle2" color="text.secondary">가입일</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.created_at}</Typography>

              <Typography variant="subtitle2" color="text.secondary">최근 로그인</Typography>
              <Typography variant="body1">{selectedUser.last_login}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
