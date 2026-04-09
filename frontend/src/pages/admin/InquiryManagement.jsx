import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, InputAdornment, Chip, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const INITIAL_INQUIRIES = [
  { id: 1, user_name: '홍길동', email: 'hong@woori.com', category: '프로그램', title: '프로그램 신청 후 승인 기간 문의', content: '프로그램을 신청했는데 승인까지 얼마나 걸리나요? 빠른 처리 부탁드립니다.', created_at: '2024.05.20', status: '대기중', answer: '' },
  { id: 2, user_name: '김영희', email: 'kim@woori.com', category: '채용', title: '이력서 파일 업로드 오류', content: '이력서를 PDF로 업로드하려고 하는데 계속 오류가 발생합니다. 파일 크기는 2MB입니다.', created_at: '2024.05.19', status: '처리중', answer: '' },
  { id: 3, user_name: '이철수', email: 'lee@woori.com', category: '학습', title: '온라인 강의 수료증 발급 문의', content: '온라인 강의를 모두 완료했는데 수료증은 어떻게 발급받을 수 있나요?', created_at: '2024.05.18', status: '답변완료', answer: '모든 강의를 완료하시면 마이페이지 > 수강내역에서 수료증 발급 버튼이 활성화됩니다. 확인해보시기 바랍니다.' },
  { id: 4, user_name: '박민수', email: 'park@woori.com', category: '회원', title: '비밀번호 변경이 안됩니다', content: '비밀번호 변경을 시도했으나 이전 비밀번호가 맞지 않다고 나옵니다. 확인 부탁드립니다.', created_at: '2024.05.17', status: '대기중', answer: '' },
  { id: 5, user_name: '정수연', email: 'jung@woori.com', category: '기타', title: '플랫폼 이용 관련 건의사항', content: '모바일에서 이용할 때 화면이 잘 안 보입니다. 모바일 최적화를 해주셨으면 합니다.', created_at: '2024.05.16', status: '답변완료', answer: '건의해주신 내용 검토 후 반영하겠습니다. 감사합니다. 현재 모바일 최적화 작업이 진행 중이며, 다음 업데이트에서 개선될 예정입니다.' },
  { id: 6, user_name: '강민호', email: 'kang@woori.com', category: '프로그램', title: '수강료 결제 방법 문의', content: '프로그램 수강료를 카드로 결제할 수 있나요?', created_at: '2024.05.14', status: '대기중', answer: '' },
];

const STATUS_FILTERS = ['전체', '대기중', '처리중', '답변완료'];

const InquiryManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showSuccess } = useNotification();

  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [tab, setTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [answer, setAnswer] = useState('');

  const getCategoryColor = (category) => {
    const colors = { '회원': 'primary', '프로그램': 'secondary', '채용': 'warning', '학습': 'info', '기타': 'default' };
    return colors[category] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = { '대기중': 'warning', '처리중': 'info', '답변완료': 'success' };
    return colors[status] || 'default';
  };

  const filtered = inquiries.filter((i) => {
    const matchTab = tab === 0 || i.status === STATUS_FILTERS[tab];
    const matchSearch = !searchTerm || i.title.includes(searchTerm) || i.user_name.includes(searchTerm);
    return matchTab && matchSearch;
  });

  const pendingCount = inquiries.filter((i) => i.status === '대기중').length;
  const inProgressCount = inquiries.filter((i) => i.status === '처리중').length;

  const handleRowClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswer(inquiry.answer || '');
    setDialogOpen(true);
  };

  const handleSubmitAnswer = () => {
    if (!selectedInquiry || !answer.trim()) return;
    setInquiries((prev) => prev.map((i) =>
      i.id === selectedInquiry.id ? { ...i, status: '답변완료', answer: answer.trim() } : i
    ));
    showSuccess('답변이 등록되었습니다');
    setDialogOpen(false);
    setSelectedInquiry(null);
  };

  const handleSetInProgress = () => {
    if (!selectedInquiry) return;
    setInquiries((prev) => prev.map((i) =>
      i.id === selectedInquiry.id ? { ...i, status: '처리중' } : i
    ));
    setSelectedInquiry((prev) => ({ ...prev, status: '처리중' }));
    showSuccess('상태가 "처리중"으로 변경되었습니다');
  };

  const handleDeleteInquiry = () => {
    if (!selectedInquiry) return;
    setInquiries((prev) => prev.filter((i) => i.id !== selectedInquiry.id));
    showSuccess('문의가 삭제되었습니다');
    setDialogOpen(false);
    setSelectedInquiry(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>문의 관리</Typography>
        <Typography variant="body2" color="text.secondary">
          고객 문의를 관리하고 답변합니다 (대기: {pendingCount}건, 처리중: {inProgressCount}건)
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, '& .MuiTab-root': { fontSize: '0.875rem' } }}>
          <Tab label={`전체 (${inquiries.length})`} />
          <Tab label={`대기중 (${pendingCount})`} />
          <Tab label={`처리중 (${inProgressCount})`} />
          <Tab label={`답변완료 (${inquiries.filter((i) => i.status === '답변완료').length})`} />
        </Tabs>

        <TextField fullWidth placeholder="제목, 문의자로 검색..." value={searchTerm} size="small"
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ mb: 3 }} />

        {isMobile ? (
          <Box>
            {filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary">문의가 없습니다</Typography>
              </Box>
            ) : (
              filtered.map((inquiry) => (
                <Box key={inquiry.id} sx={{ p: 2, mb: 1.5, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', cursor: 'pointer' }}
                  onClick={() => handleRowClick(inquiry)}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <Typography variant="body2" fontWeight={inquiry.status === '대기중' ? 600 : 500}>{inquiry.title}</Typography>
                    </Box>
                    <Chip label={inquiry.status} size="small" color={getStatusColor(inquiry.status)} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Chip label={inquiry.category} size="small" variant="outlined" color={getCategoryColor(inquiry.category)} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>{inquiry.user_name}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{inquiry.created_at}</Typography>
                </Box>
              ))
            )}
          </Box>
        ) : (
        <TableContainer>
          <Table size="small">
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">문의가 없습니다</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inquiry) => (
                  <TableRow key={inquiry.id} hover sx={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(inquiry)}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{inquiry.user_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{inquiry.email}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={inquiry.category} size="small" variant="outlined" color={getCategoryColor(inquiry.category)} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={inquiry.status === '대기중' ? 600 : 400}>
                        {inquiry.title}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{inquiry.created_at}</TableCell>
                    <TableCell align="center">
                      <Chip label={inquiry.status} size="small" color={getStatusColor(inquiry.status)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Paper>

      {/* Detail/Answer Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle fontWeight={700}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={selectedInquiry?.category} size="small" variant="outlined"
              color={getCategoryColor(selectedInquiry?.category)} />
            <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{selectedInquiry?.title}</Typography>
            <Chip label={selectedInquiry?.status} size="small" color={getStatusColor(selectedInquiry?.status)} />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              문의자: {selectedInquiry?.user_name} ({selectedInquiry?.email}) | 등록일: {selectedInquiry?.created_at}
            </Typography>
          </Box>

          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>문의 내용</Typography>
          <Box sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {selectedInquiry?.content}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>답변</Typography>
          {selectedInquiry?.status === '답변완료' ? (
            <Box sx={{ p: 2, bgcolor: '#EBF5FF', borderRadius: 1, border: '1px solid #BDDCFF' }}>
              <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {selectedInquiry?.answer}
              </Typography>
            </Box>
          ) : (
            <TextField fullWidth multiline rows={6} value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 입력해주세요..." />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Box>
            <Button color="error" onClick={handleDeleteInquiry}>삭제</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setDialogOpen(false)}>닫기</Button>
            {selectedInquiry?.status === '대기중' && (
              <Button variant="outlined" onClick={handleSetInProgress}>처리중으로 변경</Button>
            )}
            {selectedInquiry?.status !== '답변완료' && (
              <Button variant="contained" onClick={handleSubmitAnswer} disabled={!answer.trim()}>
                답변 등록
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InquiryManagement;
