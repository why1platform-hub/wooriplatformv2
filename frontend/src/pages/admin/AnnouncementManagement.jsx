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
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { announcementsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const AnnouncementManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchAnnouncements();
  }, [page]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsAPI.getAll({ page });
      setAnnouncements(response.data.announcements || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockAnnouncements = [
    { id: 1, title: '[긴급] 2024년 2분기 시니어 프로그램 모집 안내', type: '긴급', status: '게시중', date: '2024.05.20', views: 1234 },
    { id: 2, title: '플랫폼 서비스 점검 안내 (5/25 02:00-06:00)', type: '안내', status: '게시중', date: '2024.05.18', views: 567 },
    { id: 3, title: '신규 채용정보 등록 안내', type: '일반', status: '게시중', date: '2024.05.15', views: 892 },
    { id: 4, title: '[중요] 개인정보처리방침 변경 안내', type: '중요', status: '게시중', date: '2024.05.10', views: 789 },
    { id: 5, title: '5월 상담 예약 일정 안내', type: '안내', status: '예약', date: '2024.05.25', views: 0 },
  ];

  const displayAnnouncements = announcements.length > 0 ? announcements : mockAnnouncements;

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNew = () => {
    setEditMode(false);
    reset({ title: '', type: '일반', content: '' });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setEditMode(true);
    reset(selectedItem);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await announcementsAPI.delete(selectedItem.id);
      showSuccess('공지사항이 삭제되었습니다');
      fetchAnnouncements();
    } catch (error) {
      showError('삭제에 실패했습니다');
    }
    handleMenuClose();
  };

  const onSubmit = async (data) => {
    try {
      if (editMode && selectedItem) {
        await announcementsAPI.update(selectedItem.id, data);
        showSuccess('공지사항이 수정되었습니다');
      } else {
        await announcementsAPI.create(data);
        showSuccess('공지사항이 등록되었습니다');
      }
      setDialogOpen(false);
      fetchAnnouncements();
    } catch (error) {
      showError('저장에 실패했습니다');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case '긴급': return 'error';
      case '중요': return 'warning';
      case '안내': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '게시중': return 'success';
      case '예약': return 'warning';
      case '비공개': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            {t('admin.announcementManagement')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            공지사항을 관리합니다
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>
          새 공지 등록
        </Button>
      </Box>

      <Card>
        <CardContent>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="제목으로 검색..."
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
                      <TableCell width={80} align="center">분류</TableCell>
                      <TableCell>제목</TableCell>
                      <TableCell width={100} align="center">상태</TableCell>
                      <TableCell width={120} align="center">등록일</TableCell>
                      <TableCell width={80} align="center">조회수</TableCell>
                      <TableCell width={80} align="center">관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayAnnouncements.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell align="center">
                          <Chip
                            label={item.type}
                            size="small"
                            color={getTypeColor(item.type)}
                            variant={item.type === '일반' ? 'outlined' : 'filled'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.title}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={item.status} size="small" color={getStatusColor(item.status)} />
                        </TableCell>
                        <TableCell align="center">{item.date}</TableCell>
                        <TableCell align="center">{item.views}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
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
        <DialogTitle>{editMode ? '공지사항 수정' : '새 공지사항 등록'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="분류" select>
                      <MenuItem value="일반">일반</MenuItem>
                      <MenuItem value="안내">안내</MenuItem>
                      <MenuItem value="중요">중요</MenuItem>
                      <MenuItem value="긴급">긴급</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: '제목을 입력해주세요' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="제목"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: '내용을 입력해주세요' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={10}
                      label="내용"
                      error={!!errors.content}
                      helperText={errors.content?.message}
                    />
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

export default AnnouncementManagement;
