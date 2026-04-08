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
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';

const Notices = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('woori_announcements');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotices(Array.isArray(parsed) ? parsed : []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Mock data
  const mockNotices = [
    {
      id: 1,
      title: '[긴급] 2026년 2분기 시니어 프로그램 모집 안내',
      type: '긴급',
      date: '2026.03.20',
      views: 1234,
      content: '안녕하세요, 우리은행 퇴직지원 플랫폼입니다.\n\n2026년 2분기 시니어 프로그램 모집을 시작합니다.\n\n■ 모집 기간: 2026.03.20 ~ 2026.04.10\n■ 대상: 우리은행 퇴직(예정)자\n■ 프로그램: 자산관리, 부동산 투자, 창업 워크숍 등\n\n많은 관심과 참여 부탁드립니다.',
    },
    {
      id: 2,
      title: '플랫폼 서비스 점검 안내 (4/5 02:00-06:00)',
      type: '안내',
      date: '2026.03.18',
      views: 567,
      content: '안녕하세요.\n\n시스템 안정성 향상을 위해 아래와 같이 서비스 점검을 실시합니다.\n\n■ 점검 일시: 2026년 4월 5일(토) 02:00 ~ 06:00 (4시간)\n■ 영향 범위: 전체 서비스 일시 중단\n\n점검 시간 동안 서비스 이용이 불가하오니 양해 부탁드립니다.',
    },
    {
      id: 3,
      title: '신규 채용정보 등록 안내',
      type: '일반',
      date: '2026.03.15',
      views: 892,
      content: '새로운 채용정보가 등록되었습니다.\n\n금융권 및 관련 업계의 시니어 맞춤형 채용공고를 확인하시고, 적극적으로 지원해 주시기 바랍니다.\n\n채용정보 메뉴에서 확인하실 수 있습니다.',
    },
    {
      id: 4,
      title: '온라인 강의 신규 콘텐츠 업데이트',
      type: '일반',
      date: '2026.03.12',
      views: 456,
      content: '학습자료 섹션에 새로운 온라인 강의가 추가되었습니다.\n\n■ 디지털 금융 트렌드 2026\n■ 시니어를 위한 AI 활용법\n■ 건강한 은퇴 생활 설계\n\n학습자료 메뉴에서 수강하실 수 있습니다.',
    },
    {
      id: 5,
      title: '[중요] 개인정보처리방침 변경 안내',
      type: '중요',
      date: '2026.03.10',
      views: 789,
      content: '개인정보처리방침이 아래와 같이 변경됩니다.\n\n■ 시행일: 2026년 4월 1일\n■ 주요 변경사항: 개인정보 보유기간 조정, 제3자 제공 범위 명확화\n\n자세한 내용은 개인정보처리방침 페이지에서 확인하실 수 있습니다.',
    },
    {
      id: 6,
      title: '4월 상담 예약 일정 안내',
      type: '안내',
      date: '2026.03.08',
      views: 345,
      content: '4월 상담 예약이 가능합니다.\n\n■ 예약 가능 기간: 2026년 4월 1일 ~ 30일\n■ 상담 시간: 평일 09:00 ~ 17:00\n■ 상담 방법: 온라인, 오프라인, 전화\n\n상담 예약 메뉴에서 원하시는 날짜와 시간을 선택해 주세요.',
    },
    {
      id: 7,
      title: '시니어 금융 컨설턴트 채용 공고',
      type: '채용',
      date: '2026.03.05',
      views: 678,
      content: '우리은행에서 시니어 금융 컨설턴트를 모집합니다.\n\n■ 모집 인원: 0명\n■ 자격 요건: 금융권 경력 15년 이상\n■ 우대 사항: CFP, AFPK 자격증 보유자\n■ 마감일: 2026년 4월 30일\n\n채용정보 메뉴에서 자세한 내용을 확인해 주세요.',
    },
    {
      id: 8,
      title: '2026년 상반기 프로그램 결과 보고',
      type: '일반',
      date: '2026.03.01',
      views: 234,
      content: '2026년 상반기 프로그램 운영 결과를 안내드립니다.\n\n■ 총 참여자: 150명\n■ 프로그램 수: 6개\n■ 만족도: 4.7/5.0\n\n많은 관심과 참여에 감사드립니다.',
    },
  ];

  // Show admin-published notices if available, otherwise fall back to mock data
  const displayNotices = notices.length > 0 ? [...notices, ...mockNotices.filter((m) => !notices.some((n) => n.id === m.id))] : mockNotices;

  const filteredNotices = displayNotices.filter((notice) =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type) => {
    switch (type) {
      case '긴급':
        return 'error';
      case '중요':
        return 'warning';
      case '안내':
        return 'info';
      case '채용':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          {t('support.notices')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('support.noticesDescription')}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="공지사항 검색..."
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
                      <TableCell width={120} align="center">등록일</TableCell>
                      <TableCell width={80} align="center">조회수</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredNotices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                          <Typography color="text.secondary">
                            공지사항이 없습니다
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredNotices.map((notice) => (
                        <TableRow
                          key={notice.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => { setSelectedNotice(notice); setDetailOpen(true); }}
                        >
                          <TableCell align="center">
                            <Chip
                              label={notice.type}
                              size="small"
                              color={getTypeColor(notice.type)}
                              variant={notice.type === '일반' ? 'outlined' : 'filled'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {notice.title}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {notice.date}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {notice.views}
                            </Typography>
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
      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
            {selectedNotice && (
              <Chip
                label={selectedNotice.type}
                size="small"
                color={getTypeColor(selectedNotice.type)}
                variant={selectedNotice.type === '일반' ? 'outlined' : 'filled'}
              />
            )}
            <Typography variant="subtitle1" fontWeight={700} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedNotice?.title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setDetailOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedNotice && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">등록일: {selectedNotice.date}</Typography>
                <Typography variant="caption" color="text.secondary">조회수: {selectedNotice.views}</Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {selectedNotice.content || '내용이 없습니다.'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setDetailOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notices;
