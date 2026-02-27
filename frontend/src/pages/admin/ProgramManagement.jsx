import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, InputAdornment, IconButton, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tabs, Tab,
  FormControl, InputLabel, Select, Divider,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon,
  Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const INITIAL_PROGRAMS = [
  { id: 1, title_ko: '금융컨설팅 전문가 과정', category: '금융', status: '모집중', start_date: '2024.06.01', end_date: '2024.08.31', applicants: 45, capacity: 60, description: '금융 분야 전문가 양성을 위한 심화 과정입니다.' },
  { id: 2, title_ko: '부동산 투자 전략', category: '부동산', status: '마감예정', start_date: '2024.06.15', end_date: '2024.07.15', applicants: 32, capacity: 35, description: '부동산 투자의 기초부터 고급 전략까지 배웁니다.' },
  { id: 3, title_ko: '시니어 창업 아카데미', category: '창업', status: '모집중', start_date: '2024.07.01', end_date: '2024.09.30', applicants: 28, capacity: 40, description: '퇴직 후 창업을 꿈꾸는 시니어를 위한 실전 프로그램입니다.' },
  { id: 4, title_ko: '사회공헌 봉사단', category: '사회공헌', status: '진행중', start_date: '2024.05.01', end_date: '2024.12.31', applicants: 56, capacity: 100, description: '지역 사회에 기여할 수 있는 봉사 프로그램입니다.' },
  { id: 5, title_ko: '디지털 금융 활용', category: '금융', status: '종료', start_date: '2024.03.01', end_date: '2024.04.30', applicants: 40, capacity: 40, description: '디지털 금융 서비스 활용법을 배웁니다.' },
  { id: 6, title_ko: 'AI 활용 실무 과정', category: '교육', status: '모집중', start_date: '2024.07.15', end_date: '2024.10.15', applicants: 15, capacity: 30, description: 'AI 도구를 실무에 활용하는 방법을 배웁니다.' },
];

const INITIAL_APPLICATIONS = [
  { id: 1, user_name: '홍길동', email: 'hong@woori.com', program_title: '금융컨설팅 전문가 과정', applied_at: '2024.05.20', status: '승인대기' },
  { id: 2, user_name: '김영희', email: 'kim@woori.com', program_title: '부동산 투자 전략', applied_at: '2024.05.19', status: '승인대기' },
  { id: 3, user_name: '이철수', email: 'lee@woori.com', program_title: '시니어 창업 아카데미', applied_at: '2024.05.18', status: '승인대기' },
  { id: 4, user_name: '박민수', email: 'park@woori.com', program_title: '금융컨설팅 전문가 과정', applied_at: '2024.05.17', status: '승인대기' },
  { id: 5, user_name: '정수연', email: 'jung@woori.com', program_title: '사회공헌 봉사단', applied_at: '2024.05.16', status: '승인대기' },
  { id: 6, user_name: '강민호', email: 'kang@woori.com', program_title: 'AI 활용 실무 과정', applied_at: '2024.05.15', status: '승인' },
  { id: 7, user_name: '윤서아', email: 'yoon@woori.com', program_title: '금융컨설팅 전문가 과정', applied_at: '2024.05.14', status: '반려' },
];

const CATEGORIES = ['금융', '부동산', '창업', '사회공헌', '교육', '기타'];
const STATUS_OPTIONS = ['모집중', '마감예정', '진행중', '종료'];

const ProgramManagement = () => {
  const { showSuccess } = useNotification();

  const [tab, setTab] = useState(0);
  const [programs, setPrograms] = useState(INITIAL_PROGRAMS);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    title_ko: '', category: '금융', status: '모집중', start_date: '', end_date: '',
    capacity: 30, description: '',
  });

  const getCategoryColor = (cat) => {
    const colors = { '금융': 'primary', '부동산': 'secondary', '창업': 'warning', '사회공헌': 'success', '교육': 'info' };
    return colors[cat] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = { '모집중': 'success', '마감예정': 'warning', '진행중': 'info', '종료': 'default', '승인대기': 'warning', '승인': 'success', '반려': 'error' };
    return colors[status] || 'default';
  };

  const filteredPrograms = programs.filter((p) =>
    !searchTerm || p.title_ko.includes(searchTerm) || p.category.includes(searchTerm)
  );

  const filteredApps = applications.filter((a) =>
    !searchTerm || a.user_name.includes(searchTerm) || a.program_title.includes(searchTerm)
  );

  const handleMenuOpen = (e, item) => { setAnchorEl(e.currentTarget); setSelectedItem(item); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const handleAddNew = () => {
    setEditMode(false);
    setForm({ title_ko: '', category: '금융', status: '모집중', start_date: '', end_date: '', capacity: 30, description: '' });
    setDialogOpen(true);
  };

  const handleView = () => {
    setViewOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    setEditMode(true);
    setForm({
      title_ko: selectedItem.title_ko, category: selectedItem.category, status: selectedItem.status,
      start_date: selectedItem.start_date, end_date: selectedItem.end_date,
      capacity: selectedItem.capacity || 30, description: selectedItem.description || '',
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleSave = () => {
    if (!form.title_ko.trim()) return;
    if (editMode && selectedItem) {
      setPrograms((prev) => prev.map((p) =>
        p.id === selectedItem.id ? { ...p, ...form } : p
      ));
      showSuccess('프로그램이 수정되었습니다');
    } else {
      const newId = Math.max(0, ...programs.map((p) => p.id)) + 1;
      setPrograms((prev) => [...prev, { id: newId, ...form, applicants: 0 }]);
      showSuccess('프로그램이 등록되었습니다');
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
    setPrograms((prev) => prev.filter((p) => p.id !== selectedItem.id));
    showSuccess('프로그램이 삭제되었습니다');
    setDeleteConfirmOpen(false);
    setSelectedItem(null);
  };

  const handleApprove = (app) => {
    setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, status: '승인' } : a));
    showSuccess(`${app.user_name}님의 신청이 승인되었습니다`);
  };

  const handleReject = (app) => {
    setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, status: '반려' } : a));
    showSuccess(`${app.user_name}님의 신청이 반려되었습니다`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>프로그램 관리</Typography>
          <Typography variant="body2" color="text.secondary">프로그램 및 신청을 관리합니다</Typography>
        </Box>
        {tab === 0 && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>새 프로그램 등록</Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setSearchTerm(''); }}
          sx={{ mb: 3, '& .MuiTab-root': { fontSize: '0.875rem' } }}>
          <Tab label={`프로그램 목록 (${programs.length})`} />
          <Tab label={`신청 관리 (${applications.filter((a) => a.status === '승인대기').length})`} />
        </Tabs>

        <TextField fullWidth placeholder="검색..." value={searchTerm} size="small"
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ mb: 3 }} />

        {tab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>프로그램명</TableCell>
                  <TableCell align="center">분야</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center">기간</TableCell>
                  <TableCell align="center">신청/정원</TableCell>
                  <TableCell align="center" width={60}>관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPrograms.map((program) => (
                  <TableRow key={program.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={500}>{program.title_ko}</Typography></TableCell>
                    <TableCell align="center">
                      <Chip label={program.category} size="small" color={getCategoryColor(program.category)} variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={program.status} size="small" color={getStatusColor(program.status)} />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{program.start_date} ~ {program.end_date}</Typography>
                    </TableCell>
                    <TableCell align="center">{program.applicants}/{program.capacity}명</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, program)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPrograms.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">프로그램이 없습니다</Typography>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>신청자</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>프로그램</TableCell>
                  <TableCell align="center">신청일</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center">처리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={500}>{app.user_name}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{app.email}</Typography></TableCell>
                    <TableCell>{app.program_title}</TableCell>
                    <TableCell align="center">{app.applied_at}</TableCell>
                    <TableCell align="center">
                      <Chip label={app.status} size="small" color={getStatusColor(app.status)} />
                    </TableCell>
                    <TableCell align="center">
                      {app.status === '승인대기' ? (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Button size="small" variant="contained" color="success" startIcon={<ApproveIcon />}
                            onClick={() => handleApprove(app)} sx={{ fontSize: '0.75rem', minWidth: 0 }}>승인</Button>
                          <Button size="small" variant="outlined" color="error" startIcon={<RejectIcon />}
                            onClick={() => handleReject(app)} sx={{ fontSize: '0.75rem', minWidth: 0 }}>반려</Button>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">처리완료</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '8px', minWidth: 150 } }}>
        <MenuItem onClick={handleView}><ViewIcon fontSize="small" sx={{ mr: 1 }} />상세보기</MenuItem>
        <MenuItem onClick={handleEdit}><EditIcon fontSize="small" sx={{ mr: 1 }} />수정</MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />삭제
        </MenuItem>
      </Menu>

      {/* View Detail Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>프로그램 상세</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">프로그램명</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.title_ko}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">분야</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">상태</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.status}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">기간</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.start_date} ~ {selectedItem.end_date}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">신청/정원</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.applicants}/{selectedItem.capacity}명</Typography>
                </Grid>
              </Grid>
              <Typography variant="subtitle2" color="text.secondary">설명</Typography>
              <Typography variant="body1">{selectedItem.description || '-'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewOpen(false)}>닫기</Button></DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>{editMode ? '프로그램 수정' : '새 프로그램 등록'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="프로그램명" value={form.title_ko} required
                onChange={(e) => setForm({ ...form, title_ko: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>분야</InputLabel>
                <Select value={form.category} label="분야" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
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
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="정원" type="number" value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="시작일" placeholder="YYYY.MM.DD" value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="종료일" placeholder="YYYY.MM.DD" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="설명" multiline rows={4} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title_ko.trim()}>
            {editMode ? '수정' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>프로그램 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{selectedItem?.title_ko}" 프로그램을 정말 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>삭제</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramManagement;
