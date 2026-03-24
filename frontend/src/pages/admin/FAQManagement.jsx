import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, InputAdornment, IconButton, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl,
  InputLabel, Select, Divider, Tabs, Tab, Tooltip, Switch, FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon,
  Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon,
  ColorLens as ColorIcon, Circle as CircleIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const STORAGE_KEY = 'woori_faq_categories';
const FAQ_SETTINGS_KEY = 'woori_faq_settings';

const DEFAULT_CATEGORIES = [
  { name: '회원', color: '#2563EB' },
  { name: '프로그램', color: '#059669' },
  { name: '채용', color: '#DC2626' },
  { name: '학습', color: '#7C3AED' },
  { name: '기타', color: '#6B7280' },
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

const INITIAL_FAQS = [
  { id: 1, category: '회원', question: '회원가입은 어떻게 하나요?', answer: '홈페이지 우측 상단의 "회원가입" 버튼을 클릭하여 필요한 정보를 입력하시면 됩니다.', status: '게시중', views: 234 },
  { id: 2, category: '회원', question: '비밀번호를 잊어버렸어요.', answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하시면 이메일을 통해 비밀번호를 재설정할 수 있습니다.', status: '게시중', views: 189 },
  { id: 3, category: '프로그램', question: '프로그램 신청은 어떻게 하나요?', answer: '프로그램 목록에서 원하시는 프로그램을 선택한 후 "신청하기" 버튼을 클릭해주세요.', status: '게시중', views: 156 },
  { id: 4, category: '채용', question: '채용정보는 어떻게 확인하나요?', answer: '상단 메뉴의 "채용정보"를 클릭하시면 등록된 채용 공고를 확인할 수 있습니다.', status: '게시중', views: 123 },
  { id: 5, category: '학습', question: '온라인 강의는 어떻게 수강하나요?', answer: '학습자료 메뉴에서 원하는 강의를 선택하시면 바로 수강하실 수 있습니다.', status: '게시중', views: 98 },
  { id: 6, category: '기타', question: '문의는 어디에 하나요?', answer: '고객지원 > 문의하기에서 문의를 등록하시면 빠른 시간 내에 답변드리겠습니다.', status: '비공개', views: 45 },
];

const FAQManagement = () => {
  const { showSuccess } = useNotification();

  const [tabIndex, setTabIndex] = useState(0);
  const [categories, setCategories] = useState(loadCategories);
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [showViewCount, setShowViewCount] = useState(() => {
    try {
      const saved = localStorage.getItem(FAQ_SETTINGS_KEY);
      if (saved) return JSON.parse(saved).showViewCount !== false;
    } catch { /* ignore */ }
    return true;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
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
    category: categories[0]?.name || '회원', question: '', answer: '', status: '게시중',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const getCatStyle = (catName) => {
    const cat = categories.find((c) => c.name === catName);
    const color = cat?.color || '#6B7280';
    return { bg: color + '18', color };
  };

  const filtered = faqs.filter((f) => {
    const matchSearch = !searchTerm || f.question.includes(searchTerm) || f.answer.includes(searchTerm);
    const matchCategory = categoryFilter === 'all' || f.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleMenuOpen = (e, item) => { setAnchorEl(e.currentTarget); setSelectedItem(item); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const handleAddNew = () => {
    setEditMode(false);
    setForm({ category: categories[0]?.name || '회원', question: '', answer: '', status: '게시중' });
    setDialogOpen(true);
  };

  const handleView = () => {
    setViewOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    setEditMode(true);
    setForm({
      category: selectedItem.category, question: selectedItem.question,
      answer: selectedItem.answer || '', status: selectedItem.status,
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editMode && selectedItem) {
      setFaqs((prev) => prev.map((f) =>
        f.id === selectedItem.id ? { ...f, ...form } : f
      ));
      showSuccess('FAQ가 수정되었습니다');
    } else {
      const newId = Math.max(0, ...faqs.map((f) => f.id)) + 1;
      setFaqs((prev) => [...prev, { id: newId, ...form, views: 0 }]);
      showSuccess('FAQ가 등록되었습니다');
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
    setFaqs((prev) => prev.filter((f) => f.id !== selectedItem.id));
    showSuccess('FAQ가 삭제되었습니다');
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
      if (editingCat.name !== catForm.name) {
        setFaqs((prev) => prev.map((f) =>
          f.category === editingCat.name ? { ...f, category: catForm.name } : f
        ));
      }
      showSuccess('카테고리가 수정되었습니다');
    } else {
      if (categories.some((c) => c.name === catForm.name)) return;
      setCategories((prev) => [...prev, { ...catForm }]);
      showSuccess('카테고리가 추가되었습니다');
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
    showSuccess('카테고리가 삭제되었습니다');
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>FAQ 관리</Typography>
          <Typography variant="body2" color="text.secondary">자주 묻는 질문을 관리합니다 ({faqs.length}건)</Typography>
        </Box>
      </Box>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label="FAQ 목록" />
        <Tab label="카테고리 관리" icon={<ColorIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
      </Tabs>

      {/* Tab 0: FAQ List */}
      {tabIndex === 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch checked={showViewCount} onChange={(e) => {
                  const val = e.target.checked;
                  setShowViewCount(val);
                  localStorage.setItem(FAQ_SETTINGS_KEY, JSON.stringify({ showViewCount: val }));
                  showSuccess(val ? '조회수가 사용자에게 표시됩니다.' : '조회수가 사용자에게 숨겨집니다.');
                }} />
              }
              label={<Typography variant="body2" fontWeight={500}>사용자 페이지 조회수 표시</Typography>}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>새 FAQ 등록</Button>
          </Box>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField fullWidth placeholder="질문/답변으로 검색..." value={searchTerm} size="small"
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>카테고리</InputLabel>
                <Select value={categoryFilter} label="카테고리"
                  onChange={(e) => setCategoryFilter(e.target.value)}>
                  <MenuItem value="all">전체</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.name} value={c.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircleIcon sx={{ color: c.color, fontSize: 12 }} />
                        {c.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={100} align="center">카테고리</TableCell>
                    <TableCell>질문</TableCell>
                    <TableCell width={100} align="center">상태</TableCell>
                    <TableCell width={80} align="center">조회수</TableCell>
                    <TableCell width={60} align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((faq) => {
                    const catStyle = getCatStyle(faq.category);
                    return (
                      <TableRow key={faq.id} hover>
                        <TableCell align="center">
                          <Chip label={faq.category} size="small"
                            sx={{ bgcolor: catStyle.bg, color: catStyle.color, fontWeight: 600, fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} sx={{ cursor: 'pointer' }}
                            onClick={() => { setSelectedItem(faq); setViewOpen(true); }}>
                            {faq.question}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={faq.status} size="small" color={faq.status === '게시중' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell align="center">{faq.views}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, faq)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">FAQ가 없습니다</Typography>
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
            <Typography variant="subtitle1" fontWeight={600}>FAQ 카테고리 관리</Typography>
            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={handleAddCategory}>
              카테고리 추가
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {categories.map((cat) => {
              const style = getCatStyle(cat.name);
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
                등록된 카테고리가 없습니다
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
              const s = getCatStyle(selectedItem.category);
              return <Chip label={selectedItem.category} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }} />;
            })()}
            FAQ 상세
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>질문</Typography>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>{selectedItem.question}</Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>답변</Typography>
              <Box sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {selectedItem.answer || '(답변 없음)'}
                </Typography>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">조회수: {selectedItem.views}</Typography>
                <Chip label={selectedItem.status} size="small" color={selectedItem.status === '게시중' ? 'success' : 'default'} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewOpen(false)}>닫기</Button></DialogActions>
      </Dialog>

      {/* Add/Edit FAQ Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>{editMode ? 'FAQ 수정' : '새 FAQ 등록'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>카테고리</InputLabel>
                <Select value={form.category} label="카테고리"
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
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
                <Select value={form.status} label="상태"
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="게시중">게시중</MenuItem>
                  <MenuItem value="비공개">비공개</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="질문" value={form.question} required
                onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="답변" multiline rows={6} value={form.answer} required
                onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={!form.question.trim() || !form.answer.trim()}>
            {editMode ? '수정' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete FAQ Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>FAQ 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 FAQ를 정말 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>삭제</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={catDialogOpen} onClose={() => setCatDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>{editingCat ? '카테고리 수정' : '새 카테고리 추가'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField fullWidth label="카테고리명" value={catForm.name}
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
        <DialogTitle fontWeight={700}>카테고리 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{catDeleteConfirm?.name}" 카테고리를 삭제하시겠습니까?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            이 카테고리를 사용하는 FAQ가 있을 수 있습니다.
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

export default FAQManagement;
