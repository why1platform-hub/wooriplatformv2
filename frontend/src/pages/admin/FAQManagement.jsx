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
import { faqAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const FAQManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  const categories = ['회원', '프로그램', '채용', '학습', '기타'];

  useEffect(() => {
    fetchFAQs();
  }, [page]);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const response = await faqAPI.getAll({ page });
      setFaqs(response.data.faqs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockFaqs = [
    { id: 1, category: '회원', question: '회원가입은 어떻게 하나요?', status: '게시중', views: 234 },
    { id: 2, category: '회원', question: '비밀번호를 잊어버렸어요.', status: '게시중', views: 189 },
    { id: 3, category: '프로그램', question: '프로그램 신청은 어떻게 하나요?', status: '게시중', views: 156 },
    { id: 4, category: '채용', question: '채용정보는 어떻게 확인하나요?', status: '게시중', views: 123 },
    { id: 5, category: '학습', question: '온라인 강의는 어떻게 수강하나요?', status: '게시중', views: 98 },
  ];

  const displayFaqs = faqs.length > 0 ? faqs : mockFaqs;

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNew = () => {
    setEditMode(false);
    reset({ category: '회원', question: '', answer: '' });
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
      await faqAPI.delete(selectedItem.id);
      showSuccess('FAQ가 삭제되었습니다');
      fetchFAQs();
    } catch (error) {
      showError('삭제에 실패했습니다');
    }
    handleMenuClose();
  };

  const onSubmit = async (data) => {
    try {
      if (editMode && selectedItem) {
        await faqAPI.update(selectedItem.id, data);
        showSuccess('FAQ가 수정되었습니다');
      } else {
        await faqAPI.create(data);
        showSuccess('FAQ가 등록되었습니다');
      }
      setDialogOpen(false);
      fetchFAQs();
    } catch (error) {
      showError('저장에 실패했습니다');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            {t('admin.faqManagement')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            자주 묻는 질문을 관리합니다
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>
          새 FAQ 등록
        </Button>
      </Box>

      <Card>
        <CardContent>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="질문으로 검색..."
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
                      <TableCell width={100} align="center">카테고리</TableCell>
                      <TableCell>질문</TableCell>
                      <TableCell width={100} align="center">상태</TableCell>
                      <TableCell width={80} align="center">조회수</TableCell>
                      <TableCell width={80} align="center">관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayFaqs.map((faq) => (
                      <TableRow key={faq.id} hover>
                        <TableCell align="center">
                          <Chip label={faq.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {faq.question}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={faq.status}
                            size="small"
                            color={faq.status === '게시중' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">{faq.views}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, faq)}>
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
        <DialogTitle>{editMode ? 'FAQ 수정' : '새 FAQ 등록'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="카테고리" select>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Controller
                  name="question"
                  control={control}
                  rules={{ required: '질문을 입력해주세요' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="질문"
                      error={!!errors.question}
                      helperText={errors.question?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="answer"
                  control={control}
                  rules={{ required: '답변을 입력해주세요' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={6}
                      label="답변"
                      error={!!errors.answer}
                      helperText={errors.answer?.message}
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

export default FAQManagement;
