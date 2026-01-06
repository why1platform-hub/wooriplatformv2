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
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { jobsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';

const JobManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getAll({ page });
      setJobs(response.data.jobs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockJobs = [
    { id: 1, company: '우리은행', title_ko: '시니어 금융 컨설턴트', location: '서울 중구', employment_type: '계약직', status: '게시중', deadline: '2024.06.20', views: 234, applications: 12 },
    { id: 2, company: '삼성생명', title_ko: '퇴직연금 전문 상담역', location: '서울 강남구', employment_type: '정규직', status: '게시중', deadline: '2024.06.15', views: 189, applications: 8 },
    { id: 3, company: '현대건설', title_ko: '부동산 자문위원', location: '경기 성남시', employment_type: '프리랜서', status: '마감', deadline: '2024.05.20', views: 156, applications: 15 },
    { id: 4, company: '서울시 사회공헌센터', title_ko: '시니어 사회공헌 프로젝트 매니저', location: '서울 여의도', employment_type: '계약직', status: '게시중', deadline: '2024.06.30', views: 98, applications: 5 },
    { id: 5, company: 'KB증권', title_ko: '자산관리 전문가', location: '서울 여의도', employment_type: '정규직', status: '임시저장', deadline: '2024.07.10', views: 0, applications: 0 },
  ];

  const displayJobs = jobs.length > 0 ? jobs : mockJobs;

  const handleMenuOpen = (event, job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNew = () => {
    setEditMode(false);
    reset({
      company: '',
      title_ko: '',
      location: '',
      employment_type: '',
      salary_range: '',
      description: '',
      deadline: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setEditMode(true);
    reset(selectedJob);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await jobsAPI.delete(selectedJob.id);
      showSuccess('채용 공고가 삭제되었습니다');
      fetchJobs();
    } catch (error) {
      showError('삭제에 실패했습니다');
    }
    handleMenuClose();
  };

  const onSubmit = async (data) => {
    try {
      if (editMode && selectedJob) {
        await jobsAPI.update(selectedJob.id, data);
        showSuccess('채용 공고가 수정되었습니다');
      } else {
        await jobsAPI.create(data);
        showSuccess('채용 공고가 등록되었습니다');
      }
      setDialogOpen(false);
      fetchJobs();
    } catch (error) {
      showError('저장에 실패했습니다');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '게시중': return 'success';
      case '마감': return 'default';
      case '임시저장': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            {t('admin.jobManagement')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            채용 공고를 관리합니다
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>
          새 공고 등록
        </Button>
      </Box>

      <Card>
        <CardContent>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="회사명, 직무로 검색..."
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
                      <TableCell>회사</TableCell>
                      <TableCell>직무</TableCell>
                      <TableCell align="center">지역</TableCell>
                      <TableCell align="center">고용형태</TableCell>
                      <TableCell align="center">상태</TableCell>
                      <TableCell align="center">마감일</TableCell>
                      <TableCell align="center">조회/지원</TableCell>
                      <TableCell align="center">관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayJobs.map((job) => (
                      <TableRow key={job.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {job.company}
                          </Typography>
                        </TableCell>
                        <TableCell>{job.title_ko}</TableCell>
                        <TableCell align="center">{job.location}</TableCell>
                        <TableCell align="center">
                          <Chip label={job.employment_type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={job.status} size="small" color={getStatusColor(job.status)} />
                        </TableCell>
                        <TableCell align="center">{job.deadline}</TableCell>
                        <TableCell align="center">
                          {job.views} / {job.applications}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, job)}>
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

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          상세보기
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          수정
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          삭제
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? '채용 공고 수정' : '새 채용 공고 등록'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="company"
                  control={control}
                  rules={{ required: '회사명을 입력해주세요' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="회사명"
                      error={!!errors.company}
                      helperText={errors.company?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="title_ko"
                  control={control}
                  rules={{ required: '직무명을 입력해주세요' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="직무명"
                      error={!!errors.title_ko}
                      helperText={errors.title_ko?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="근무지" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="employment_type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="고용형태" select>
                      <MenuItem value="정규직">정규직</MenuItem>
                      <MenuItem value="계약직">계약직</MenuItem>
                      <MenuItem value="프리랜서">프리랜서</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="salary_range"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="급여" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="deadline"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="마감일" placeholder="YYYY.MM.DD" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth multiline rows={6} label="상세 내용" />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            {editMode ? '수정' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobManagement;
