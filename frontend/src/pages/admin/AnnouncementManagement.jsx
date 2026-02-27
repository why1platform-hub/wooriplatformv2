import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, InputAdornment, IconButton, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl,
  InputLabel, Select, Divider,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon,
  Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: '[긴급] 2024년 2분기 시니어 프로그램 모집 안내', type: '긴급', status: '게시중', date: '2024.05.20', views: 1234, content: '2024년 2분기 시니어 프로그램 모집을 시작합니다. 금융컨설팅, 부동산, 창업 등 다양한 프로그램에 참여하세요.' },
  { id: 2, title: '플랫폼 서비스 점검 안내 (5/25 02:00-06:00)', type: '안내', status: '게시중', date: '2024.05.18', views: 567, content: '서비스 안정성 향상을 위한 정기 점검이 예정되어 있습니다.' },
  { id: 3, title: '신규 채용정보 등록 안내', type: '일반', status: '게시중', date: '2024.05.15', views: 892, content: '새로운 채용 정보가 등록되었습니다. 채용공고 페이지를 확인해보세요.' },
  { id: 4, title: '[중요] 개인정보처리방침 변경 안내', type: '중요', status: '게시중', date: '2024.05.10', views: 789, content: '개인정보처리방침이 변경되었습니다. 상세 내용을 확인해주세요.' },
  { id: 5, title: '5월 상담 예약 일정 안내', type: '안내', status: '예약', date: '2024.05.25', views: 0, content: '5월 상담 예약 일정을 안내드립니다.' },
  { id: 6, title: '신규 온라인 강좌 오픈 안내', type: '일반', status: '비공개', date: '2024.05.08', views: 45, content: '새로운 온라인 강좌가 오픈되었습니다.' },
];

const TYPE_OPTIONS = ['일반', '안내', '중요', '긴급'];
const STATUS_OPTIONS = ['게시중', '예약', '비공개'];

const AnnouncementManagement = () => {
  const { showSuccess } = useNotification();

  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    title: '', type: '일반', status: '게시중', content: '',
  });

  const getTypeColor = (type) => {
    const colors = { '긴급': 'error', '중요': 'warning', '안내': 'info', '일반': 'default' };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = { '게시중': 'success', '예약': 'warning', '비공개': 'default' };
    return colors[status] || 'default';
  };

  const filtered = announcements.filter((a) =>
    !searchTerm || a.title.includes(searchTerm)
  );

  const handleMenuOpen = (e, item) => { setAnchorEl(e.currentTarget); setSelectedItem(item); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const handleAddNew = () => {
    setEditMode(false);
    setForm({ title: '', type: '일반', status: '게시중', content: '' });
    setDialogOpen(true);
  };

  const handleView = () => {
    setViewOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    setEditMode(true);
    setForm({
      title: selectedItem.title, type: selectedItem.type,
      status: selectedItem.status, content: selectedItem.content || '',
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editMode && selectedItem) {
      setAnnouncements((prev) => prev.map((a) =>
        a.id === selectedItem.id ? { ...a, ...form } : a
      ));
      showSuccess('공지사항이 수정되었습니다');
    } else {
      const newId = Math.max(0, ...announcements.map((a) => a.id)) + 1;
      setAnnouncements((prev) => [...prev, {
        id: newId, ...form, views: 0,
        date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      }]);
      showSuccess('공지사항이 등록되었습니다');
    }
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (!selectedItem) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== selectedItem.id));
    showSuccess('공지사항이 삭제되었습니다');
    setDeleteConfirmOpen(false);
    setSelectedItem(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>공지사항 관리</Typography>
          <Typography variant="body2" color="text.secondary">공지사항을 관리합니다 ({announcements.length}건)</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>새 공지 등록</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <TextField fullWidth placeholder="제목으로 검색..." value={searchTerm} size="small"
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ mb: 3 }} />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={80} align="center">분류</TableCell>
                <TableCell>제목</TableCell>
                <TableCell width={100} align="center">상태</TableCell>
                <TableCell width={120} align="center">등록일</TableCell>
                <TableCell width={80} align="center">조회수</TableCell>
                <TableCell width={60} align="center">관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell align="center">
                    <Chip label={item.type} size="small" color={getTypeColor(item.type)}
                      variant={item.type === '일반' ? 'outlined' : 'filled'} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} sx={{ cursor: 'pointer' }}
                      onClick={() => { setSelectedItem(item); setViewOpen(true); }}>
                      {item.title}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={item.status} size="small" color={getStatusColor(item.status)} />
                  </TableCell>
                  <TableCell align="center">{item.date}</TableCell>
                  <TableCell align="center">{item.views.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">공지사항이 없습니다</Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '8px', minWidth: 150 } }}>
        <MenuItem onClick={handleView}><ViewIcon fontSize="small" sx={{ mr: 1 }} />보기</MenuItem>
        <MenuItem onClick={handleEdit}><EditIcon fontSize="small" sx={{ mr: 1 }} />수정</MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />삭제
        </MenuItem>
      </Menu>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedItem && <Chip label={selectedItem.type} size="small" color={getTypeColor(selectedItem?.type)} />}
            {selectedItem?.title}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography variant="caption" color="text.secondary">등록일: {selectedItem.date}</Typography>
                <Typography variant="caption" color="text.secondary">조회수: {selectedItem.views}</Typography>
                <Chip label={selectedItem.status} size="small" color={getStatusColor(selectedItem.status)} />
              </Box>
              <Box sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {selectedItem.content || '(내용 없음)'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewOpen(false)}>닫기</Button></DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>{editMode ? '공지사항 수정' : '새 공지사항 등록'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>분류</InputLabel>
                <Select value={form.type} label="분류" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPE_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select value={form.status} label="상태" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="제목" value={form.title} required
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="내용" multiline rows={8} value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title.trim()}>
            {editMode ? '수정' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>공지사항 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 공지사항을 정말 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>삭제</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementManagement;
