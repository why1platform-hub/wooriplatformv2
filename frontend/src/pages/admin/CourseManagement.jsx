import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, InputAdornment, IconButton, Chip, Menu, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, Pagination, Grid, Tabs, Tab,
  Avatar, FormControlLabel, Radio, RadioGroup, Paper, Divider,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon, Edit as EditIcon,
  Delete as DeleteIcon, Visibility as VisibilityIcon, PlayCircle as PlayIcon,
  CloudUpload as UploadIcon, Link as LinkIcon, Image as ImageIcon, Close as CloseIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon, VideoLibrary as VideoIcon,
  Person as PersonIcon,
  ArrowUpward as MoveUpIcon, ArrowDownward as MoveDownIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import VideoEditorDialog from '../../components/admin/VideoEditorDialog';
import { getAllCourses, saveCourses as persistCourses, loadCoursesSync } from '../../utils/courseStore';

const toAdminCourse = (c) => ({
  id: c.id,
  title: c.title,
  category: c.category || '기타',
  instructor: c.instructor || '',
  duration: c.duration || '',
  lessons: typeof c.lessons === 'number' ? c.lessons : (c.lessons?.length || 0),
  _lessonsData: Array.isArray(c.lessons) ? c.lessons : (Array.isArray(c._lessonsData) ? c._lessonsData : []),
  status: c.status || '게시중',
  views: c.views || 0,
  enrollments: c.enrollments || 0,
  description: c.description || '',
  videoType: c.videoType || 'url',
  videoUrl: c.videoUrl || c.video_url || '',
  videoFileName: c.videoFileName || '',
  videoFileSize: c.videoFileSize || '',
  coverImage: c.coverImage || c.thumbnail || null,
});

// eslint-disable-next-line no-unused-vars
const buildInitialCourses = () => {
  const stored = loadCoursesSync();
  return stored.map(toAdminCourse);
};

const initialStudentRequests = [
  { id: 1, courseId: 1, studentName: '홍길동', email: 'hong@email.com', requestDate: '2026-02-27', status: '대기중' },
  { id: 2, courseId: 1, studentName: '박민수', email: 'park@email.com', requestDate: '2026-02-26', status: '대기중' },
  { id: 3, courseId: 2, studentName: '이영희', email: 'lee@email.com', requestDate: '2026-02-26', status: '승인' },
  { id: 4, courseId: 1, studentName: '최지우', email: 'choi@email.com', requestDate: '2026-02-25', status: '승인' },
  { id: 5, courseId: 3, studentName: '강서연', email: 'kang@email.com', requestDate: '2026-02-25', status: '대기중' },
  { id: 6, courseId: 2, studentName: '윤재호', email: 'yoon@email.com', requestDate: '2026-02-24', status: '거절' },
  { id: 7, courseId: 5, studentName: '서하나', email: 'seo@email.com', requestDate: '2026-02-24', status: '대기중' },
];

const categories = ['금융', '부동산', '창업', '사회공헌', '디지털', '건강', '여가', '재무'];
const instructors = ['김강사', '이미영', '박준혁', '한소영', '최수진', '정민호'];
const MAX_VIDEO_SIZE_MB = 300;

const CourseManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [courses, setCoursesState] = useState([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const normalizeCourse = (c) => {
    const videoUrl = c.videoUrl || c.video_url || '';
    let lessons = Array.isArray(c._lessonsData) && c._lessonsData.length > 0
      ? c._lessonsData
      : (Array.isArray(c.lessons) ? c.lessons : []);
    if (lessons.length === 0 && videoUrl) {
      lessons = [{ id: 'l1', title: c.title, duration: c.duration || '', video_url: videoUrl }];
    } else if (lessons.length > 0) {
      // Only fill in video_url for lessons that don't have their own
      lessons = lessons.map((l) => ({ ...l, video_url: l.video_url || videoUrl }));
    }
    return {
      id: String(c.id),
      title: c.title,
      category: c.category || '기타',
      instructor: c.instructor || '',
      duration: c.duration || '',
      views: c.views || 0,
      created_at: c.created_at || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      thumbnail: c.coverImage || c.thumbnail || '',
      video_url: videoUrl,
      status: c.status || '게시중',
      description: c.description || '',
      lessons,
      enrollments: c.enrollments || 0,
    };
  };

  const setCourses = (updater) => {
    setCoursesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Fire Supabase save asynchronously outside state setter
      const normalized = next.map(normalizeCourse);
      persistCourses(normalized).catch((e) => console.error('persistCourses failed:', e));
      return next;
    });
  };
  // Load from Supabase (single source of truth)
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllCourses();
        if (data.length > 0) {
          setCoursesState(data.map(toAdminCourse));
        }
      } catch { /* ignore */ }
      setCoursesLoaded(true);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [studentRequests, setStudentRequests] = useState(initialStudentRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  const [videoSegments, setVideoSegments] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '', category: '금융', instructor: '', description: '',
    videoType: 'url', videoUrl: '', videoFile: null, videoFileName: '', videoFileSize: '',
    coverImage: null, coverImagePreview: null, status: '준비중',
    lessonsData: [],
  });

  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Filter courses for instructor role
  const isAdminUser = isAdmin();
  const visibleCourses = isAdminUser
    ? courses
    : courses.filter((c) => c.instructor === user?.name_ko);

  const filtered = visibleCourses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const pendingCount = studentRequests.filter((s) => s.status === '대기중').length;

  // ─── Handlers ────────────────────────────────────────────────

  const resetForm = () => {
    setForm({
      title: '', category: '금융', instructor: isAdminUser ? '' : (user?.name_ko || ''),
      description: '', videoType: 'url', videoUrl: '', videoFile: null, videoFileName: '',
      videoFileSize: '', coverImage: null, coverImagePreview: null, status: '준비중',
      lessonsData: [],
    });
  };

  const handleAdd = () => {
    setEditMode(false);
    resetForm();
    if (!isAdminUser) {
      setForm((prev) => ({ ...prev, instructor: user?.name_ko || '' }));
    }
    setDialogOpen(true);
  };

  const handleEdit = () => {
    if (!selectedCourse) return;
    setEditMode(true);
    const existingLessons = Array.isArray(selectedCourse._lessonsData) && selectedCourse._lessonsData.length > 0
      ? selectedCourse._lessonsData
      : [];
    setForm({
      title: selectedCourse.title,
      category: selectedCourse.category,
      instructor: selectedCourse.instructor,
      description: selectedCourse.description || '',
      videoType: selectedCourse.videoType || 'url',
      videoUrl: selectedCourse.videoUrl || '',
      videoFile: null,
      videoFileName: selectedCourse.videoFileName || '',
      videoFileSize: selectedCourse.videoFileSize || '',
      coverImage: null,
      coverImagePreview: selectedCourse.coverImage || null,
      status: selectedCourse.status,
      lessonsData: existingLessons,
    });
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (!selectedCourse) return;
    if (!window.confirm(`"${selectedCourse.title}" 강의를 삭제하시겠습니까?`)) return;
    setCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
    setStudentRequests((prev) => prev.filter((s) => s.courseId !== selectedCourse.id));
    showSuccess('강의가 삭제되었습니다');
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
    setAnchorEl(null);
  };

  const handleSave = () => {
    if (!form.title.trim()) { showError('강의명을 입력해주세요'); return; }
    if (!form.instructor.trim()) { showError('강사를 선택해주세요'); return; }

    if (editMode && selectedCourse) {
      setCourses((prev) => prev.map((c) =>
        c.id === selectedCourse.id
          ? {
              ...c, title: form.title, category: form.category, instructor: form.instructor,
              description: form.description, videoType: form.videoType, videoUrl: form.videoUrl,
              videoFileName: form.videoFileName, videoFileSize: form.videoFileSize,
              coverImage: form.coverImagePreview, status: form.status,
              lessons: form.lessonsData.length,
              _lessonsData: form.lessonsData,
            }
          : c
      ));
      showSuccess('강의가 수정되었습니다');
    } else {
      const newCourse = {
        id: Math.max(0, ...courses.map((c) => c.id)) + 1,
        title: form.title, category: form.category, instructor: form.instructor,
        description: form.description, duration: '0분',
        lessons: form.lessonsData.length,
        _lessonsData: form.lessonsData,
        status: form.status, views: 0, enrollments: 0,
        videoType: form.videoType, videoUrl: form.videoUrl,
        videoFileName: form.videoFileName, videoFileSize: form.videoFileSize,
        coverImage: form.coverImagePreview,
      };
      setCourses((prev) => [newCourse, ...prev]);
      showSuccess('강의가 등록되었습니다');
    }
    setDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_SIZE_MB) {
      showError(`파일 크기가 ${MAX_VIDEO_SIZE_MB}MB를 초과합니다 (${sizeMB.toFixed(1)}MB)`);
      return;
    }
    setForm((prev) => ({
      ...prev, videoFile: file, videoFileName: file.name,
      videoFileSize: sizeMB < 1 ? `${(sizeMB * 1024).toFixed(0)}KB` : `${sizeMB.toFixed(1)}MB`,
    }));
    // Open video editor after file selection
    setVideoEditorOpen(true);
  };

  const handleOpenVideoEditor = () => {
    setVideoEditorOpen(true);
  };

  const handleSaveVideoSegments = (trimData) => {
    setVideoSegments(trimData);
    // Update form duration from trim data
    if (trimData.totalDuration > 0) {
      const mins = Math.floor(trimData.totalDuration / 60);
      const secs = Math.floor(trimData.totalDuration % 60);
      const durationStr = mins >= 60
        ? `${Math.floor(mins / 60)}시간 ${mins % 60}분`
        : `${mins}분 ${secs}초`;
      setForm((prev) => ({ ...prev, duration: durationStr }));
    }
    showSuccess(`${trimData.segments.length}개 세그먼트가 저장되었습니다`);
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, coverImage: file, coverImagePreview: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleApproveStudent = (studentId) => {
    setStudentRequests((prev) => prev.map((s) =>
      s.id === studentId ? { ...s, status: '승인' } : s
    ));
    showSuccess('수강 신청이 승인되었습니다');
  };

  const handleRejectStudent = (studentId) => {
    setStudentRequests((prev) => prev.map((s) =>
      s.id === studentId ? { ...s, status: '거절' } : s
    ));
    showSuccess('수강 신청이 거절되었습니다');
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
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: { xs: 1.5, sm: 0 } }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>강의 관리</Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdminUser ? '모든 온라인 강의를 관리합니다' : '내 강의를 관리합니다'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          새 강의 등록
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, '& .MuiTab-root': { fontSize: '0.875rem' } }}
      >
        <Tab label={`강의 목록 (${visibleCourses.length})`} />
        <Tab label={`수강 신청 관리 (${pendingCount} 대기)`} />
      </Tabs>

      {/* ─── Tab 0: Course List ──────────────────────────────────── */}
      {tab === 0 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth size="small" placeholder="강의명, 강사명으로 검색..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
          </Box>
          {isMobile ? (
            <Box sx={{ p: 2 }}>
              {!coursesLoaded ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">강의 불러오는 중...</Typography>
                </Box>
              ) : paged.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">등록된 강의가 없습니다</Typography>
                </Box>
              ) : paged.map((course) => (
                <Box key={course.id} sx={{ p: 2, mb: 1.5, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, mr: 1 }}>
                      {course.coverImage ? (
                        <Avatar variant="rounded" src={course.coverImage} sx={{ width: 40, height: 28 }} />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 40, height: 28, bgcolor: '#EBF0FA' }}>
                          <PlayIcon sx={{ fontSize: 16, color: '#0047BA' }} />
                        </Avatar>
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{course.title}</Typography>
                        {isAdminUser && <Typography variant="caption" color="text.secondary">{course.instructor}</Typography>}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedCourse(course); }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label={course.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    <Chip label={course.status} size="small" color={getStatusColor(course.status)} />
                    <Typography variant="caption" color="text.secondary">{course.duration}</Typography>
                    <Typography variant="caption" color="text.secondary">{course.lessons}강</Typography>
                    <Typography variant="caption" color="text.secondary">조회 {course.views.toLocaleString()} / 수강 {course.enrollments}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>강의명</TableCell>
                    <TableCell align="center">분야</TableCell>
                    {isAdminUser && <TableCell align="center">강사</TableCell>}
                    <TableCell align="center">강의수</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">조회/수강</TableCell>
                    <TableCell align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!coursesLoaded ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">강의 불러오는 중...</Typography>
                    </TableCell></TableRow>
                  ) : paged.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">등록된 강의가 없습니다</Typography>
                    </TableCell></TableRow>
                  ) : paged.map((course) => (
                    <TableRow key={course.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {course.coverImage ? (
                            <Avatar variant="rounded" src={course.coverImage} sx={{ width: 40, height: 28 }} />
                          ) : (
                            <Avatar variant="rounded" sx={{ width: 40, height: 28, bgcolor: '#EBF0FA' }}>
                              <PlayIcon sx={{ fontSize: 16, color: '#0047BA' }} />
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{course.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {course.videoType === 'url' ? '🔗 URL' : '📁 파일'} · {course.duration}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={course.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      </TableCell>
                      {isAdminUser && <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>{course.instructor}</TableCell>}
                      <TableCell align="center">{course.lessons}강</TableCell>
                      <TableCell align="center">
                        <Chip label={course.status} size="small" color={getStatusColor(course.status)} />
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>
                        {course.views.toLocaleString()} / {course.enrollments}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedCourse(course); }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />
            </Box>
          )}
        </Paper>
      )}

      {/* ─── Tab 1: Student Enrollment Requests ──────────────────── */}
      {tab === 1 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
          {isMobile ? (
            <Box sx={{ p: 2 }}>
              {studentRequests
                .filter((s) => isAdminUser || courses.some((c) => c.id === s.courseId && c.instructor === user?.name_ko))
                .map((req) => {
                  const course = courses.find((c) => c.id === req.courseId);
                  return (
                    <Box key={req.id} sx={{ p: 2, mb: 1.5, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#0047BA' }}>
                            {req.studentName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{req.studentName}</Typography>
                            <Typography variant="caption" color="text.secondary">{req.email}</Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={req.status} size="small"
                          color={req.status === '승인' ? 'success' : req.status === '거절' ? 'error' : 'warning'}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {course?.title || '-'} · {req.requestDate}
                      </Typography>
                      {req.status === '대기중' && (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                          <Button size="small" variant="contained" color="success" startIcon={<ApproveIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => handleApproveStudent(req.id)} sx={{ fontSize: '0.7rem', py: 0.25, flex: 1 }}>
                            승인
                          </Button>
                          <Button size="small" variant="outlined" color="error" startIcon={<RejectIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => handleRejectStudent(req.id)} sx={{ fontSize: '0.7rem', py: 0.25, flex: 1 }}>
                            거절
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                })}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>학생</TableCell>
                    <TableCell>강의</TableCell>
                    <TableCell align="center">신청일</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">처리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentRequests
                    .filter((s) => isAdminUser || courses.some((c) => c.id === s.courseId && c.instructor === user?.name_ko))
                    .map((req) => {
                      const course = courses.find((c) => c.id === req.courseId);
                      return (
                        <TableRow key={req.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#0047BA' }}>
                                {req.studentName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>{req.studentName}</Typography>
                                <Typography variant="caption" color="text.secondary">{req.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem' }}>{course?.title || '-'}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>{req.requestDate}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={req.status} size="small"
                              color={req.status === '승인' ? 'success' : req.status === '거절' ? 'error' : 'warning'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {req.status === '대기중' ? (
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Button size="small" variant="contained" color="success" startIcon={<ApproveIcon sx={{ fontSize: '14px !important' }} />}
                                  onClick={() => handleApproveStudent(req.id)} sx={{ fontSize: '0.7rem', py: 0.25 }}>
                                  승인
                                </Button>
                                <Button size="small" variant="outlined" color="error" startIcon={<RejectIcon sx={{ fontSize: '14px !important' }} />}
                                  onClick={() => handleRejectStudent(req.id)} sx={{ fontSize: '0.7rem', py: 0.25 }}>
                                  거절
                                </Button>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">처리완료</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* ─── Context Menu ─────────────────────────────────────────── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handlePreview}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> 미리보기
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> 수정
        </MenuItem>
        {isAdminUser && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> 삭제
          </MenuItem>
        )}
      </Menu>

      {/* ─── Add/Edit Dialog ──────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editMode ? '강의 수정' : '새 강의 등록'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="강의명" value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="분야" select value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="강사" select value={form.instructor}
                onChange={(e) => setForm((p) => ({ ...p, instructor: e.target.value }))}
                disabled={!isAdminUser} required>
                {instructors.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="상태" select value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                <MenuItem value="준비중">준비중</MenuItem>
                <MenuItem value="게시중">게시중</MenuItem>
                <MenuItem value="비공개">비공개</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="강의 설명" multiline rows={3} value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </Grid>

            {/* Video Source */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>강의 영상</Typography>
              <RadioGroup row value={form.videoType}
                onChange={(e) => setForm((p) => ({ ...p, videoType: e.target.value }))}>
                <FormControlLabel value="url" control={<Radio size="small" />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LinkIcon fontSize="small" /> URL 링크</Box>} />
                <FormControlLabel value="file" control={<Radio size="small" />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><UploadIcon fontSize="small" /> 파일 업로드 (최대 {MAX_VIDEO_SIZE_MB}MB)</Box>} />
              </RadioGroup>
            </Grid>

            {form.videoType === 'url' ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField fullWidth label="영상 URL" placeholder="https://youtube.com/watch?v=..."
                    value={form.videoUrl} onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon fontSize="small" /></InputAdornment> }} />
                  <Button
                    variant="outlined"
                    onClick={handleOpenVideoEditor}
                    disabled={!form.videoUrl}
                    startIcon={<PlayIcon />}
                    sx={{ mt: 0.5, minWidth: 130, whiteSpace: 'nowrap' }}
                  >
                    Edit / Trim
                  </Button>
                </Box>
                {videoSegments && (
                  <Chip label={`${videoSegments.segments.length} segment(s) saved`} color="success" size="small" sx={{ mt: 1 }} />
                )}
              </Grid>
            ) : (
              <Grid item xs={12}>
                <input type="file" accept="video/*" ref={videoInputRef} hidden onChange={handleVideoFileChange} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => videoInputRef.current?.click()}>
                    영상 파일 선택
                  </Button>
                  {form.videoFileName && (
                    <>
                      <Chip label={`${form.videoFileName} (${form.videoFileSize})`} onDelete={() => { setForm((p) => ({ ...p, videoFile: null, videoFileName: '', videoFileSize: '' })); setVideoSegments(null); }} />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleOpenVideoEditor}
                        startIcon={<PlayIcon />}
                      >
                        Edit / Trim
                      </Button>
                    </>
                  )}
                </Box>
                {videoSegments && (
                  <Chip label={`${videoSegments.segments.length} segment(s) saved`} color="success" size="small" sx={{ mt: 1 }} />
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  지원 형식: MP4, AVI, MOV, WMV (최대 {MAX_VIDEO_SIZE_MB}MB)
                </Typography>
              </Grid>
            )}

            {/* Cover Image */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                대표 이미지 (선택사항)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                업로드하지 않으면 영상 썸네일이 대표 이미지로 사용됩니다.
              </Typography>
              <input type="file" accept="image/*" ref={imageInputRef} hidden onChange={handleCoverImageChange} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => imageInputRef.current?.click()}>
                  이미지 선택
                </Button>
                {form.coverImagePreview && (
                  <Box sx={{ position: 'relative' }}>
                    <Avatar variant="rounded" src={form.coverImagePreview}
                      sx={{ width: 120, height: 68, border: '1px solid', borderColor: 'divider' }} />
                    <IconButton size="small"
                      onClick={() => setForm((p) => ({ ...p, coverImage: null, coverImagePreview: null }))}
                      sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: '#fff', width: 20, height: 20,
                        '&:hover': { bgcolor: 'error.dark' } }}>
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* ─── Lesson Editor ─── */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>강의 구성 (레슨)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    각 레슨에 제목, 영상 URL, 시간을 설정합니다 ({form.lessonsData.length}개)
                  </Typography>
                </Box>
                <Button
                  size="small" variant="contained" startIcon={<AddIcon />}
                  onClick={() => {
                    const newId = `l${Date.now()}`;
                    setForm((p) => ({
                      ...p,
                      lessonsData: [...p.lessonsData, { id: newId, title: `${p.lessonsData.length + 1}강. `, duration: '', video_url: p.videoUrl || '' }],
                    }));
                  }}
                >
                  레슨 추가
                </Button>
              </Box>

              {form.lessonsData.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed' }}>
                  <VideoIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    레슨이 없습니다. "레슨 추가" 버튼을 눌러 강의를 구성하세요.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    레슨을 추가하지 않으면 영상 URL이 단일 레슨으로 자동 생성됩니다.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {form.lessonsData.map((lesson, index) => (
                    <Paper key={lesson.id} variant="outlined" sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-start', bgcolor: '#FAFAFA', '&:hover': { bgcolor: '#F0F4FF' } }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                        <DragIcon fontSize="small" sx={{ color: 'text.disabled', mb: 0.5 }} />
                        <Chip label={index + 1} size="small" sx={{ fontWeight: 700, minWidth: 28, height: 22 }} color="primary" variant="outlined" />
                      </Box>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                          fullWidth size="small" label="레슨 제목"
                          value={lesson.title}
                          onChange={(e) => {
                            const updated = [...form.lessonsData];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setForm((p) => ({ ...p, lessonsData: updated }));
                          }}
                          placeholder={`${index + 1}강. 레슨 제목 입력`}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            size="small" label="영상 URL" sx={{ flex: 1 }}
                            value={lesson.video_url}
                            onChange={(e) => {
                              const updated = [...form.lessonsData];
                              updated[index] = { ...updated[index], video_url: e.target.value };
                              setForm((p) => ({ ...p, lessonsData: updated }));
                            }}
                            placeholder="https://youtube.com/watch?v=..."
                            InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 16 }} /></InputAdornment> }}
                          />
                          <TextField
                            size="small" label="시간" sx={{ width: 100 }}
                            value={lesson.duration}
                            onChange={(e) => {
                              const updated = [...form.lessonsData];
                              updated[index] = { ...updated[index], duration: e.target.value };
                              setForm((p) => ({ ...p, lessonsData: updated }));
                            }}
                            placeholder="15:00"
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, pt: 0.5 }}>
                        <IconButton size="small" disabled={index === 0}
                          onClick={() => {
                            const updated = [...form.lessonsData];
                            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
                            setForm((p) => ({ ...p, lessonsData: updated }));
                          }}>
                          <MoveUpIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" disabled={index === form.lessonsData.length - 1}
                          onClick={() => {
                            const updated = [...form.lessonsData];
                            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
                            setForm((p) => ({ ...p, lessonsData: updated }));
                          }}>
                          <MoveDownIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" color="error"
                          onClick={() => {
                            setForm((p) => ({ ...p, lessonsData: p.lessonsData.filter((_, i) => i !== index) }));
                          }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave}>{editMode ? '수정' : '등록'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Video Editor Dialog ──────────────────────────────────── */}
      <VideoEditorDialog
        open={videoEditorOpen}
        onClose={() => setVideoEditorOpen(false)}
        videoUrl={form.videoUrl}
        videoFile={form.videoFile}
        videoType={form.videoType}
        onSave={handleSaveVideoSegments}
      />

      {/* ─── Preview Dialog ───────────────────────────────────────── */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700} fontSize="1rem">강의 미리보기</Typography>
          <IconButton size="small" onClick={() => setPreviewOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCourse && (
            <Box>
              {selectedCourse.coverImage ? (
                <Box component="img" src={selectedCourse.coverImage} alt={selectedCourse.title}
                  sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '8px', mb: 2 }} />
              ) : (
                <Box sx={{ width: '100%', height: 200, bgcolor: '#EBF0FA', borderRadius: '8px', mb: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VideoIcon sx={{ fontSize: 48, color: '#0047BA' }} />
                </Box>
              )}
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{selectedCourse.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={selectedCourse.category} size="small" variant="outlined" />
                <Chip label={selectedCourse.status} size="small" color={getStatusColor(selectedCourse.status)} />
                <Chip icon={<PersonIcon sx={{ fontSize: '14px !important' }} />} label={selectedCourse.instructor} size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedCourse.description || '설명이 없습니다.'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">강의수</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedCourse.lessons}강</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">조회수</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedCourse.views.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">수강생</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedCourse.enrollments}명</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">영상 소스</Typography>
              <Typography variant="body2">
                {selectedCourse.videoType === 'url'
                  ? (selectedCourse.videoUrl || '미등록')
                  : `📁 ${selectedCourse.videoFileName || '미등록'} ${selectedCourse.videoFileSize ? `(${selectedCourse.videoFileSize})` : ''}`
                }
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CourseManagement;
