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
  Pagination,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayCircle as PlayIcon,
} from '@mui/icons-material';
import { coursesAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import CategoryBadge from '../../components/common/CategoryBadge';

const CourseManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [page]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await coursesAPI.getAll({ page });
      setCourses(response.data.courses || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockCourses = [
    { id: 1, title: '은퇴 후 스마트한 자산 관리', category: '금융', instructor: '김재테크', duration: '2시간 15분', lessons: 6, status: '게시중', views: 1234, enrollments: 89 },
    { id: 2, title: '성공적인 부동산 투자 전략', category: '부동산', instructor: '박부동', duration: '1시간 45분', lessons: 5, status: '게시중', views: 892, enrollments: 56 },
    { id: 3, title: '시니어 창업 성공 사례', category: '창업', instructor: '이창업', duration: '2시간 30분', lessons: 8, status: '게시중', views: 567, enrollments: 34 },
    { id: 4, title: '사회공헌 활동 시작하기', category: '사회공헌', instructor: '최봉사', duration: '1시간 20분', lessons: 4, status: '게시중', views: 423, enrollments: 28 },
    { id: 5, title: '디지털 금융 활용법', category: '금융', instructor: '정디지털', duration: '1시간 50분', lessons: 5, status: '준비중', views: 0, enrollments: 0 },
  ];

  const displayCourses = courses.length > 0 ? courses : mockCourses;

  const handleMenuOpen = (event, course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await coursesAPI.delete(selectedCourse.id);
      showSuccess('강의가 삭제되었습니다');
      fetchCourses();
    } catch (error) {
      showError('삭제에 실패했습니다');
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '게시중': return 'success';
      case '준비중': return 'warning';
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
            {t('admin.courseManagement')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            온라인 강의를 관리합니다
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          새 강의 등록
        </Button>
      </Box>

      <Card>
        <CardContent>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="강의명, 강사명으로 검색..."
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
                      <TableCell>강의명</TableCell>
                      <TableCell align="center">분야</TableCell>
                      <TableCell align="center">강사</TableCell>
                      <TableCell align="center">강의수</TableCell>
                      <TableCell align="center">상태</TableCell>
                      <TableCell align="center">조회/수강</TableCell>
                      <TableCell align="center">관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayCourses.map((course) => (
                      <TableRow key={course.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PlayIcon color="action" fontSize="small" />
                            <Typography variant="body2" fontWeight={500}>
                              {course.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <CategoryBadge category={course.category} />
                        </TableCell>
                        <TableCell align="center">{course.instructor}</TableCell>
                        <TableCell align="center">{course.lessons}강</TableCell>
                        <TableCell align="center">
                          <Chip label={course.status} size="small" color={getStatusColor(course.status)} />
                        </TableCell>
                        <TableCell align="center">
                          {course.views} / {course.enrollments}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, course)}>
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
          미리보기
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          수정
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          삭제
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CourseManagement;
