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
  TextField,
  InputAdornment,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
  Skeleton,
  Divider,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { inquiriesAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';

const InquiryManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusFilters = ['전체', '대기중', '처리중', '답변완료'];

  useEffect(() => {
    fetchInquiries();
  }, [tab, page]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const status = tab === 0 ? undefined : statusFilters[tab];
      const response = await inquiriesAPI.getAll({ page, status });
      setInquiries(response.data.inquiries || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockInquiries = [
    { id: 1, user_name: '홍길동', category: '프로그램', title: '프로그램 신청 후 승인 기간 문의', created_at: '2024.05.20', status: '대기중' },
    { id: 2, user_name: '김영희', category: '채용', title: '이력서 파일 업로드 오류', created_at: '2024.05.19', status: '처리중' },
    { id: 3, user_name: '이철수', category: '학습', title: '온라인 강의 수료증 발급 문의', created_at: '2024.05.18', status: '답변완료', answer: '모든 강의를 완료하시면 수료증 발급 버튼이 활성화됩니다.' },
    { id: 4, user_name: '박민수', category: '회원', title: '비밀번호 변경이 안됩니다', created_at: '2024.05.17', status: '대기중' },
    { id: 5, user_name: '정수연', category: '기타', title: '플랫폼 이용 관련 건의사항', created_at: '2024.05.16', status: '답변완료', answer: '건의해주신 내용 검토 후 반영하겠습니다. 감사합니다.' },
  ];

  const displayInquiries = inquiries.length > 0 ? inquiries : mockInquiries;

  const filteredInquiries = tab === 0
    ? displayInquiries
    : displayInquiries.filter((i) => i.status === statusFilters[tab]);

  const getCategoryLabel = (category) => {
    const labels = {
      account: '회원/계정',
      program: '프로그램',
      job: '채용정보',
      learning: '학습자료',
      technical: '기술 문제',
      other: '기타',
    };
    return labels[category] || category;
  };

  const handleRowClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswer(inquiry.answer || '');
    setDialogOpen(true);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedInquiry || !answer.trim()) return;
    setSubmitting(true);
    try {
      await inquiriesAPI.answer(selectedInquiry.id, { answer });
      showSuccess('답변이 등록되었습니다');
      setDialogOpen(false);
      fetchInquiries();
    } catch (error) {
      showError('답변 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          {t('admin.inquiryManagement')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          고객 문의를 관리하고 답변합니다
        </Typography>
      </Box>

      <Card>
        <CardContent>
          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(e, v) => { setTab(v); setPage(1); }}
            sx={{ mb: 3, borderBottom: '1px solid #E5E5E5' }}
          >
            {statusFilters.map((status, index) => (
              <Tab key={status} label={status} />
            ))}
          </Tabs>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="제목, 문의자로 검색..."
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
                      <TableCell width={100}>문의자</TableCell>
                      <TableCell width={100} align="center">분류</TableCell>
                      <TableCell>제목</TableCell>
                      <TableCell width={120} align="center">등록일</TableCell>
                      <TableCell width={100} align="center">상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInquiries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <Typography color="text.secondary">
                            문의가 없습니다
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInquiries.map((inquiry) => (
                        <TableRow
                          key={inquiry.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleRowClick(inquiry)}
                        >
                          <TableCell>{inquiry.user_name}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getCategoryLabel(inquiry.category)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {inquiry.title}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{inquiry.created_at}</TableCell>
                          <TableCell align="center">
                            <StatusBadge status={inquiry.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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

      {/* Detail/Answer Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={getCategoryLabel(selectedInquiry?.category)}
              size="small"
              variant="outlined"
            />
            <Typography variant="h6" fontWeight={600}>
              {selectedInquiry?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* User Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              문의자: {selectedInquiry?.user_name} | 등록일: {selectedInquiry?.created_at}
            </Typography>
          </Box>

          {/* Question */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              문의 내용
            </Typography>
            <Box sx={{ p: 2, backgroundColor: '#F8F9FA', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                {selectedInquiry?.content || '문의 내용이 여기에 표시됩니다.'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Answer */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                답변
              </Typography>
              <StatusBadge status={selectedInquiry?.status} />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 입력해주세요..."
              disabled={selectedInquiry?.status === '답변완료'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>닫기</Button>
          {selectedInquiry?.status !== '답변완료' && (
            <Button
              variant="contained"
              onClick={handleSubmitAnswer}
              disabled={submitting || !answer.trim()}
            >
              {submitting ? '등록 중...' : '답변 등록'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InquiryManagement;
