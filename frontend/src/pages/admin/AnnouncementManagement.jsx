import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, InputAdornment, IconButton, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl,
  InputLabel, Select, Divider, Tabs, Tab, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon,
  Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon,
  ColorLens as ColorIcon, Circle as CircleIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const STORAGE_KEY = 'woori_announcement_categories';

const DEFAULT_CATEGORIES = [
  { name: '일반', color: '#6B7280' },
  { name: '안내', color: '#2563EB' },
  { name: '중요', color: '#D97706' },
  { name: '긴급', color: '#DC2626' },
];

const PRESET_COLORS = [
  '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A',
  '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB', '#4F46E5',
  '#7C3AED', '#9333EA', '#C026D3', '#DB2777', '#E11D48', '#6B7280',
];

const loadCategories = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_CATEGORIES;
};

const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: '[긴급] 2024년 2분기 시니어 프로그램 모집 안내', type: '긴급', status: '게시중', date: '2024.05.20', views: 1234, content: '2024년 2분기 시니어 프로그램 모집을 시작합니다. 금융컨설팅, 부동산, 창업 등 다양한 프로그램에 참여하세요.' },
  { id: 2, title: '플랫폼 서비스 점검 안내 (5/25 02:00-06:00)', type: '안내', status: '게시중', date: '2024.05.18', views: 567, content: '서비스 안정성 향상을 위한 정기 점검이 예정되어 있습니다.' },
  { id: 3, title: '신규 채용정보 등록 안내', type: '일반', status: '게시중', date: '2024.05.15', views: 892, content: '새로운 채용 정보가 등록되었습니다. 채용공고 페이지를 확인해보세요.' },
  { id: 4, title: '[중요] 개인정보처리방침 변경 안내', type: '중요', status: '게시중', date: '2024.05.10', views: 789, content: '개인정보처리방침이 변경되었습니다. 상세 내용을 확인해주세요.' },
  { id: 5, title: '5월 상담 예약 일정 안내', type: '안내', status: '예약', date: '2024.05.25', views: 0, content: '5월 상담 예약 일정을 안내드립니다.' },
  { id: 6, title: '신규 온라인 강좌 오픈 안내', type: '일반', status: '비공개', date: '2024.05.08', views: 45, content: '새로운 온라인 강좌가 오픈되었습니다.' },
];

const STATUS_OPTIONS = ['게시중', '예약', '비공개'];

const AnnouncementManagement = () => {
  const { showSuccess } = useNotification();

  const [tabIndex, setTabIndex] = useState(0);
  const [categories, setCategories] = useState(loadCategories);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Category management state
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', color: '#2563EB' });
  const [catDeleteConfirm, setCatDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    title: '', type: categories[0]?.name || '일반', status: '게시중', content: '',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const getTypeStyle = (type) => {
    const cat = categories.find((c) => c.name === type);
    const color = cat?.color || '#6B7280';
    return { bg: color + '18', color };
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
    setForm({ title: '', type: categories[0]?.name || '일반', status: '게시중', content: '' });
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

  // Category handlers
  const handleAddCategory = () => {
    setEditingCat(null);
    setCatForm({ name: '', color: '#2563EB' });
    setCatDialogOpen(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, color: cat.color });
    setCatDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!catForm.name.trim()) return;
    if (editingCat) {
      setCategories((prev) => prev.map((c) =>
        c.name === editingCat.name ? { ...catForm } : c
      ));
      // Update announcements that used old name
      if (editingCat.name !== catForm.name) {
        setAnnouncements((prev) => prev.map((a) =>
          a.type === editingCat.name ? { ...a, type: catForm.name } : a
        ));
      }
      showSuccess('분류가 수정되었습니다');
    } else {
      if (categories.some((c) => c.name === catForm.name)) return;
      setCategories((prev) => [...prev, { ...catForm }]);
      showSuccess('분류가 추가되었습니다');
    }
    setCatDialogOpen(false);
  };

  const handleDeleteCategory = (cat) => {
    setCatDeleteConfirm(cat);
  };

  const confirmDeleteCategory = () => {
    if (!catDeleteConfirm) return;
    setCategories((prev) => prev.filter((c) => c.name !== catDeleteConfirm.name));
    setCatDeleteConfirm(null);
    showSuccess('분류가 삭제되었습니다');
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>공지사항 관리</Typography>
          <Typography variant="body2" color="text.secondary">공지사항을 관리합니다 ({announcements.length}건)</Typography>
        </Box>
      </Box>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label="공지사항 목록" />
        <Tab label="분류 관리" icon={<ColorIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
      </Tabs>

      {/* Tab 0: Announcements List */}
      {tabIndex === 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
                  {filtered.map((item) => {
                    const typeStyle = getTypeStyle(item.type);
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell align="center">
                          <Chip label={item.type} size="small"
                            sx={{ bgcolor: typeStyle.bg, color: typeStyle.color, fontWeight: 600, fontSize: '0.75rem' }} />
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
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">공지사항이 없습니다</Typography>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Tab 1: Category Management */}
      {tabIndex === 1 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>공지사항 분류 관리</Typography>
            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={handleAddCategory}>
              분류 추가
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {categories.map((cat) => {
              const style = getTypeStyle(cat.name);
              return (
                <Paper key={cat.name} elevation={0} sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '10px',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircleIcon sx={{ color: cat.color, fontSize: 20 }} />
                    <Chip label={cat.name} size="small"
                      sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600 }} />
                    <Typography variant="body2" color="text.secondary">{cat.color}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="수정">
                      <IconButton size="small" onClick={() => handleEditCategory(cat)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                      <IconButton size="small" color="error" onClick={() => handleDeleteCategory(cat)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              );
            })}
            {categories.length === 0 && (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                등록된 분류가 없습니다
              </Typography>
            )}
          </Box>
        </Paper>
      )}

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
            {selectedItem && (() => {
              const s = getTypeStyle(selectedItem.type);
              return <Chip label={selectedItem.type} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }} />;
            })()}
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

      {/* Add/Edit Announcement Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>{editMode ? '공지사항 수정' : '새 공지사항 등록'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>분류</InputLabel>
                <Select value={form.type} label="분류" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {categories.map((c) => (
                    <MenuItem key={c.name} value={c.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircleIcon sx={{ color: c.color, fontSize: 14 }} />
                        {c.name}
                      </Box>
                    </MenuItem>
                  ))}
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

      {/* Delete Announcement Confirmation */}
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

      {/* Add/Edit Category Dialog */}
      <Dialog open={catDialogOpen} onClose={() => setCatDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>{editingCat ? '분류 수정' : '새 분류 추가'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField fullWidth label="분류명" value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>색상 선택</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PRESET_COLORS.map((c) => (
                  <Box key={c} onClick={() => setCatForm({ ...catForm, color: c })}
                    sx={{
                      width: 32, height: 32, borderRadius: '8px', bgcolor: c, cursor: 'pointer',
                      border: catForm.color === c ? '3px solid #1a1a1a' : '2px solid transparent',
                      transition: 'all 0.15s', '&:hover': { transform: 'scale(1.15)' },
                    }} />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField label="직접 입력" value={catForm.color} size="small" sx={{ width: 140 }}
                onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} />
              <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: catForm.color, border: '1px solid #E5E5E5' }} />
              <Chip label={catForm.name || '미리보기'} size="small"
                sx={{ bgcolor: catForm.color + '18', color: catForm.color, fontWeight: 600 }} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCatDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveCategory} disabled={!catForm.name.trim()}>
            {editingCat ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog open={!!catDeleteConfirm} onClose={() => setCatDeleteConfirm(null)}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>분류 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{catDeleteConfirm?.name}" 분류를 삭제하시겠습니까?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            이 분류를 사용하는 공지사항이 있을 수 있습니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCatDeleteConfirm(null)}>취소</Button>
          <Button variant="contained" color="error" onClick={confirmDeleteCategory}>삭제</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementManagement;
