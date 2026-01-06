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
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Skeleton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { announcementsAPI } from '../../services/api';

const Notices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const response = await announcementsAPI.getAll({ page, search: searchTerm });
        setNotices(response.data.announcements || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error('Failed to fetch notices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [page, searchTerm]);

  // Mock data
  const mockNotices = [
    {
      id: 1,
      title: '[긴급] 2024년 2분기 시니어 프로그램 모집 안내',
      type: '긴급',
      date: '2024.05.20',
      views: 1234,
    },
    {
      id: 2,
      title: '플랫폼 서비스 점검 안내 (5/25 02:00-06:00)',
      type: '안내',
      date: '2024.05.18',
      views: 567,
    },
    {
      id: 3,
      title: '신규 채용정보 등록 안내',
      type: '일반',
      date: '2024.05.15',
      views: 892,
    },
    {
      id: 4,
      title: '온라인 강의 신규 콘텐츠 업데이트',
      type: '일반',
      date: '2024.05.12',
      views: 456,
    },
    {
      id: 5,
      title: '[중요] 개인정보처리방침 변경 안내',
      type: '중요',
      date: '2024.05.10',
      views: 789,
    },
    {
      id: 6,
      title: '5월 상담 예약 일정 안내',
      type: '안내',
      date: '2024.05.08',
      views: 345,
    },
    {
      id: 7,
      title: '시니어 금융 컨설턴트 채용 공고',
      type: '채용',
      date: '2024.05.05',
      views: 678,
    },
    {
      id: 8,
      title: '2024년 상반기 프로그램 결과 보고',
      type: '일반',
      date: '2024.05.01',
      views: 234,
    },
  ];

  const displayNotices = notices.length > 0 ? notices : mockNotices;

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
                          onClick={() => navigate(`/support/notices/${notice.id}`)}
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
    </Box>
  );
};

export default Notices;
