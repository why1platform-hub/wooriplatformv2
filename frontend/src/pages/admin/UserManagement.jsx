import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, InputAdornment, IconButton, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl,
  InputLabel, Select, Divider, Avatar,
} from '@mui/material';
import {
  Search as SearchIcon, MoreVert as MoreVertIcon, Edit as EditIcon,
  Block as BlockIcon, CheckCircle as ActiveIcon,
  Delete as DeleteIcon, PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

const INITIAL_USERS = [
  { id: 1, name_ko: '홍길동', email: 'hong@woori.com', role: 'learner', status: 'active', department: '금융컨설팅팀', phone: '010-1234-5678', created_at: '2024.01.15', last_login: '2024.05.20' },
  { id: 2, name_ko: '김영희', email: 'kim@woori.com', role: 'learner', status: 'active', department: '자산관리팀', phone: '010-2345-6789', created_at: '2024.02.10', last_login: '2024.05.19' },
  { id: 3, name_ko: '이철수', email: 'lee@woori.com', role: 'instructor', status: 'active', department: '교육팀', phone: '010-3456-7890', created_at: '2024.01.20', last_login: '2024.05.18' },
  { id: 4, name_ko: '박민수', email: 'park@woori.com', role: 'learner', status: 'inactive', department: '영업팀', phone: '010-4567-8901', created_at: '2024.03.05', last_login: '2024.04.10' },
  { id: 5, name_ko: '정수연', email: 'jung@woori.com', role: 'career_counselor', status: 'active', department: '상담팀', phone: '010-5678-9012', created_at: '2024.01.25', last_login: '2024.05.20' },
  { id: 6, name_ko: '최지영', email: 'choi@woori.com', role: 'hr_manager', status: 'active', department: 'HR팀', phone: '010-6789-0123', created_at: '2024.01.10', last_login: '2024.05.20' },
  { id: 7, name_ko: '강민호', email: 'kang@woori.com', role: 'learner', status: 'active', department: '마케팅팀', phone: '010-7890-1234', created_at: '2024.04.01', last_login: '2024.05.17' },
  { id: 8, name_ko: '윤서아', email: 'yoon@woori.com', role: 'learner', status: 'suspended', department: '기획팀', phone: '010-8901-2345', created_at: '2024.02.20', last_login: '2024.03.15' },
  { id: 9, name_ko: '김강사', email: 'instructor@woori.com', role: 'instructor', status: 'active', department: '교육팀', phone: '010-1111-2222', created_at: '2024.01.05', last_login: '2024.05.21' },
  { id: 10, name_ko: '최고관리자', email: 'admin@woori.com', role: 'admin', status: 'active', department: '시스템관리팀', phone: '010-0000-0000', created_at: '2024.01.01', last_login: '2024.05.21' },
];

const ROLE_OPTIONS = [
  { value: 'learner', label: '학습자' },
  { value: 'instructor', label: '강사' },
  { value: 'career_counselor', label: '상담사' },
  { value: 'hr_manager', label: 'HR 관리자' },
  { value: 'admin', label: '최고관리자' },
];

const UserManagement = () => {
  const { showSuccess } = useNotification();
  const { isAdmin } = useAuth();

  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    name_ko: '', email: '', role: 'learner', department: '', phone: '', status: 'active',
  });

  const getRoleLabel = (role) => ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
  const getRoleColor = (role) => {
    const colors = { learner: 'default', instructor: 'info', career_counselor: 'secondary', hr_manager: 'warning', admin: 'error' };
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
    setForm({ name_ko: '', email: '', role: 'learner', department: '', phone: '', status: 'active' });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setEditMode(true);
    setForm({
      name_ko: selectedUser.name_ko, email: selectedUser.email, role: selectedUser.role,
      department: selectedUser.department || '', phone: selectedUser.phone || '', status: selectedUser.status,
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleSave = () => {
    if (!form.name_ko.trim() || !form.email.trim()) return;
    if (editMode && selectedUser) {
      setUsers((prev) => prev.map((u) =>
        u.id === selectedUser.id ? { ...u, ...form } : u
      ));
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

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    showSuccess('사용자가 삭제되었습니다');
    setDeleteConfirmOpen(false);
    setSelectedUser(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth placeholder="이름, 이메일로 검색..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>역할 필터</InputLabel>
            <Select value={roleFilter} label="역할 필터" onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="all">전체</MenuItem>
              {ROLE_OPTIONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

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
                <TableCell align="center" width={60}>관리</TableCell>
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
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
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
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '8px', minWidth: 160 } }}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>{editMode ? '사용자 수정' : '새 사용자 등록'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="이름" value={form.name_ko} required
                onChange={(e) => setForm({ ...form, name_ko: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="이메일" value={form.email} required
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
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
              <TextField fullWidth label="연락처" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>사용자 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{selectedUser?.name_ko}" 사용자를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>삭제</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
