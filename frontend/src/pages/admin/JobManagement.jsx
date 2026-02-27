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

const INITIAL_JOBS = [
  { id: 1, company: '우리은행', title_ko: '시니어 금융 컨설턴트', location: '서울 중구', employment_type: '계약직', status: '게시중', deadline: '2024.06.20', views: 234, applications: 12, salary_range: '4,000~5,000만원', description: '금융 컨설팅 경험이 풍부한 시니어 전문가를 모집합니다.' },
  { id: 2, company: '삼성생명', title_ko: '퇴직연금 전문 상담역', location: '서울 강남구', employment_type: '정규직', status: '게시중', deadline: '2024.06.15', views: 189, applications: 8, salary_range: '5,000~6,000만원', description: '퇴직연금 관련 전문 상담 업무를 담당합니다.' },
  { id: 3, company: '현대건설', title_ko: '부동산 자문위원', location: '경기 성남시', employment_type: '프리랜서', status: '마감', deadline: '2024.05.20', views: 156, applications: 15, salary_range: '협의', description: '부동산 개발 프로젝트 자문 업무입니다.' },
  { id: 4, company: '서울시 사회공헌센터', title_ko: '시니어 사회공헌 프로젝트 매니저', location: '서울 여의도', employment_type: '계약직', status: '게시중', deadline: '2024.06.30', views: 98, applications: 5, salary_range: '3,500~4,000만원', description: '사회공헌 프로젝트 기획 및 운영을 담당합니다.' },
  { id: 5, company: 'KB증권', title_ko: '자산관리 전문가', location: '서울 여의도', employment_type: '정규직', status: '임시저장', deadline: '2024.07.10', views: 0, applications: 0, salary_range: '6,000만원~', description: '고액자산가 대상 자산관리 서비스를 제공합니다.' },
];

const EMPLOYMENT_TYPES = ['정규직', '계약직', '프리랜서', '파트타임'];
const STATUS_OPTIONS = ['게시중', '마감', '임시저장'];

const JobManagement = () => {
  const { showSuccess } = useNotification();

  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    company: '', title_ko: '', location: '', employment_type: '정규직',
    salary_range: '', deadline: '', description: '', status: '게시중',
  });

  const getStatusColor = (status) => {
    const colors = { '게시중': 'success', '마감': 'default', '임시저장': 'warning' };
    return colors[status] || 'default';
  };

  const filtered = jobs.filter((j) =>
    !searchTerm || j.company.includes(searchTerm) || j.title_ko.includes(searchTerm)
  );

  const handleMenuOpen = (e, job) => { setAnchorEl(e.currentTarget); setSelectedJob(job); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const handleAddNew = () => {
    setEditMode(false);
    setForm({ company: '', title_ko: '', location: '', employment_type: '정규직', salary_range: '', deadline: '', description: '', status: '게시중' });
    setDialogOpen(true);
  };

  const handleView = () => {
    setViewOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    setEditMode(true);
    setForm({
      company: selectedJob.company, title_ko: selectedJob.title_ko, location: selectedJob.location,
      employment_type: selectedJob.employment_type, salary_range: selectedJob.salary_range || '',
      deadline: selectedJob.deadline, description: selectedJob.description || '', status: selectedJob.status,
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleSave = () => {
    if (!form.company.trim() || !form.title_ko.trim()) return;
    if (editMode && selectedJob) {
      setJobs((prev) => prev.map((j) =>
        j.id === selectedJob.id ? { ...j, ...form } : j
      ));
      showSuccess('채용 공고가 수정되었습니다');
    } else {
      const newId = Math.max(0, ...jobs.map((j) => j.id)) + 1;
      setJobs((prev) => [...prev, { id: newId, ...form, views: 0, applications: 0 }]);
      showSuccess('채용 공고가 등록되었습니다');
    }
    setDialogOpen(false);
    setSelectedJob(null);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (!selectedJob) return;
    setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
    showSuccess('채용 공고가 삭제되었습니다');
    setDeleteConfirmOpen(false);
    setSelectedJob(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>채용 관리</Typography>
          <Typography variant="body2" color="text.secondary">채용 공고를 관리합니다 ({jobs.length}건)</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>새 공고 등록</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <TextField fullWidth placeholder="회사명, 직무로 검색..." value={searchTerm} size="small"
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ mb: 3 }} />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>회사</TableCell>
                <TableCell>직무</TableCell>
                <TableCell align="center">지역</TableCell>
                <TableCell align="center">고용형태</TableCell>
                <TableCell align="center">상태</TableCell>
                <TableCell align="center">마감일</TableCell>
                <TableCell align="center">조회/지원</TableCell>
                <TableCell align="center" width={60}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={500}>{job.company}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ cursor: 'pointer' }}
                      onClick={() => { setSelectedJob(job); setViewOpen(true); }}>
                      {job.title_ko}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{job.location}</TableCell>
                  <TableCell align="center">
                    <Chip label={job.employment_type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={job.status} size="small" color={getStatusColor(job.status)} />
                  </TableCell>
                  <TableCell align="center">{job.deadline}</TableCell>
                  <TableCell align="center">{job.views} / {job.applications}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, job)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">채용 공고가 없습니다</Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
        <DialogTitle fontWeight={700}>채용 공고 상세</DialogTitle>
        <DialogContent dividers>
          {selectedJob && (
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>{selectedJob.title_ko}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedJob.company}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">지역</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{selectedJob.location}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">고용형태</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{selectedJob.employment_type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">급여</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{selectedJob.salary_range || '협의'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">마감일</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{selectedJob.deadline}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">조회수</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{selectedJob.views}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">지원자 수</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{selectedJob.applications}명</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary">상세 내용</Typography>
              <Box sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: 1, mt: 1 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {selectedJob.description || '(내용 없음)'}
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
        <DialogTitle fontWeight={700}>{editMode ? '채용 공고 수정' : '새 채용 공고 등록'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="회사명" value={form.company} required
                onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="직무명" value={form.title_ko} required
                onChange={(e) => setForm({ ...form, title_ko: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="근무지" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>고용형태</InputLabel>
                <Select value={form.employment_type} label="고용형태"
                  onChange={(e) => setForm({ ...form, employment_type: e.target.value })}>
                  {EMPLOYMENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="급여" value={form.salary_range}
                onChange={(e) => setForm({ ...form, salary_range: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="마감일" placeholder="YYYY.MM.DD" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select value={form.status} label="상태"
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="상세 내용" multiline rows={6} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.company.trim() || !form.title_ko.trim()}>
            {editMode ? '수정' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>채용 공고 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{selectedJob?.title_ko}" 공고를 정말 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>삭제</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobManagement;
