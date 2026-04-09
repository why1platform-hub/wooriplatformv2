import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useMediaQuery, useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import StatusBadge from '../../components/common/StatusBadge';

const InquiryList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { loadInquiries } = await import('../../utils/supportStore');
        const data = await loadInquiries();
        setInquiries(data);
      } catch (error) {
        console.error('Failed to fetch inquiries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Mock data
  const mockInquiries = [
    {
      id: 1,
      category: '프로그램',
      title: '프로그램 신청 후 승인 기간 문의',
      content: '5월 15일에 금융컨설팅 프로그램을 신청했는데, 승인까지 보통 얼마나 걸리나요?',
      status: '답변완료',
      created_at: '2024.05.15',
      answered_at: '2024.05.16',
      answer: '안녕하세요, 문의해주셔서 감사합니다. 프로그램 신청 후 승인은 보통 3-5 영업일 내에 처리됩니다. 현재 신청하신 프로그램은 검토 중이며, 곧 결과를 안내드리겠습니다. 감사합니다.',
    },
    {
      id: 2,
      category: '채용정보',
      title: '이력서 파일 업로드 오류',
      content: 'PDF 이력서 파일을 업로드하려고 하는데 계속 오류가 발생합니다. 확인 부탁드립니다.',
      status: '처리중',
      created_at: '2024.05.18',
      answered_at: null,
      answer: null,
    },
    {
      id: 3,
      category: '학습자료',
      title: '온라인 강의 수료증 발급 문의',
      content: '모든 강의를 완료했는데 수료증 발급 버튼이 활성화되지 않습니다.',
      status: '대기중',
      created_at: '2024.05.20',
      answered_at: null,
      answer: null,
    },
  ];

  const displayInquiries = inquiries.length > 0 ? inquiries : mockInquiries;

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
    setDialogOpen(true);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            {t('support.myInquiries')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            등록하신 문의 내역을 확인하실 수 있습니다
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/support/inquiry')}
        >
          새 문의 등록
        </Button>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <Box>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : displayInquiries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                등록된 문의가 없습니다
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/support/inquiry')}
              >
                문의 등록하기
              </Button>
            </Box>
          ) : isMobile ? (
              <Box>
                {displayInquiries.map((inquiry) => (
                  <Box key={inquiry.id} onClick={() => handleRowClick(inquiry)}
                    sx={{ p: 2, mb: 1, borderRadius: '10px', border: '1px solid #E5E7EB', cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Chip label={getCategoryLabel(inquiry.category)} size="small" variant="outlined" />
                      <StatusBadge status={inquiry.status} />
                    </Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>{inquiry.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{inquiry.created_at}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={100} align="center">분류</TableCell>
                    <TableCell>제목</TableCell>
                    <TableCell width={120} align="center">등록일</TableCell>
                    <TableCell width={100} align="center">상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(inquiry)}>
                      <TableCell align="center"><Chip label={getCategoryLabel(inquiry.category)} size="small" variant="outlined" /></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{inquiry.title}</Typography></TableCell>
                      <TableCell align="center"><Typography variant="body2" color="text.secondary">{inquiry.created_at}</Typography></TableCell>
                      <TableCell align="center"><StatusBadge status={inquiry.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
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
          {/* Question */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                문의 내용
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedInquiry?.created_at}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              {selectedInquiry?.content}
            </Typography>
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
            {selectedInquiry?.answer ? (
              <>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  {selectedInquiry.answer}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  답변일: {selectedInquiry.answered_at}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                아직 답변이 등록되지 않았습니다. 빠른 시일 내에 답변 드리겠습니다.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InquiryList;
