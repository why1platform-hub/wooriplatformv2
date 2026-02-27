import React, { useState, useRef } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, InputAdornment, IconButton, Chip, Menu, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, Pagination, Grid, Tabs, Tab,
  Avatar, FormControlLabel, Radio, RadioGroup, Paper, Divider,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon, Edit as EditIcon,
  Delete as DeleteIcon, Visibility as VisibilityIcon, PlayCircle as PlayIcon,
  CloudUpload as UploadIcon, Link as LinkIcon, Image as ImageIcon, Close as CloseIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon, VideoLibrary as VideoIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const initialCourses = [
  { id: 1, title: '은퇴 후 스마트한 자산 관리', category: '금융', instructor: '김강사', duration: '2시간 15분', lessons: 6, status: '게시중', views: 1234, enrollments: 89, description: '은퇴 후 자산을 효율적으로 관리하는 방법을 배웁니다.', videoType: 'url', videoUrl: 'https://www.youtube.com/watch?v=example1', coverImage: null },
  { id: 2, title: '성공적인 부동산 투자 전략', category: '부동산', instructor: '이미영', duration: '1시간 45분', lessons: 5, status: '게시중', views: 892, enrollments: 56, description: '부동산 투자의 기초부터 실전까지.', videoType: 'url', videoUrl: 'https://www.youtube.com/watch?v=example2', coverImage: null },
  { id: 3, title: '시니어 창업 성공 사례', category: '창업', instructor: '박준혁', duration: '2시간 30분', lessons: 8, status: '게시중', views: 567, enrollments: 34, description: '시니어 창업 성공 사례와 노하우를 공유합니다.', videoType: 'file', videoFileName: 'startup_lecture.mp4', videoFileSize: '245MB', coverImage: null },
  { id: 4, title: '사회공헌 활동 시작하기', category: '사회공헌', instructor: '한소영', duration: '1시간 20분', lessons: 4, status: '게시중', views: 423, enrollments: 28, description: '의미있는 사회공헌 활동을 시작하는 방법.', videoType: 'url', videoUrl: 'https://vimeo.com/example', coverImage: null },
  { id: 5, title: '디지털 금융 활용법', category: '디지털', instructor: '김강사', duration: '1시간 50분', lessons: 5, status: '준비중', views: 0, enrollments: 0, description: '디지털 금융 서비스 활용 가이드.', videoType: 'url', videoUrl: '', coverImage: null },
];

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
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [courses, setCourses] = useState(initialCourses);
  const [studentRequests, setStudentRequests] = useState(initialStudentRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '', category: '금융', instructor: '', description: '',
    videoType: 'url', videoUrl: '', videoFile: null, videoFileName: '', videoFileSize: '',
    coverImage: null, coverImagePreview: null, status: '준비중',
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
            }
          : c
      ));
      showSuccess('강의가 수정되었습니다');
    } else {
      const newCourse = {
        id: Math.max(0, ...courses.map((c) => c.id)) + 1,
        title: form.title, category: form.category, instructor: form.instructor,
        description: form.description, duration: '0분', lessons: 0,
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>강의 관리</Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdminUser ? '모든 온라인 강의를 관리합니다' : '내 강의를 관리합니다'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
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
                {paged.length === 0 ? (
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
        PaperProps={{ sx: { borderRadius: '12px' } }}>
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
                <TextField fullWidth label="영상 URL" placeholder="https://youtube.com/watch?v=..."
                  value={form.videoUrl} onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon fontSize="small" /></InputAdornment> }} />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <input type="file" accept="video/*" ref={videoInputRef} hidden onChange={handleVideoFileChange} />
                <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => videoInputRef.current?.click()}
                  sx={{ mr: 2 }}>
                  영상 파일 선택
                </Button>
                {form.videoFileName && (
                  <Chip label={`${form.videoFileName} (${form.videoFileSize})`} onDelete={() => setForm((p) => ({ ...p, videoFile: null, videoFileName: '', videoFileSize: '' }))} sx={{ mt: 1 }} />
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave}>{editMode ? '수정' : '등록'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Preview Dialog ───────────────────────────────────────── */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
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
