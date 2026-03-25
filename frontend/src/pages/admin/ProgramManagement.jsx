import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, InputAdornment, IconButton, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tabs, Tab,
  FormControl, InputLabel, Select, Divider,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon,
  Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import {
  loadPrograms, savePrograms,
  loadApplications, saveApplications,
} from '../../utils/programStore';

const CATEGORIES = ['금융컨설팅', '부동산', '창업', '사회공헌', '교육', '기타'];
const STATUS_OPTIONS = ['모집중', '마감예정', '진행중', '종료'];

const ProgramManagement = () => {
  const { showSuccess } = useNotification();

  const [tab, setTab] = useState(0);
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    title_ko: '', category: '금융컨설팅', status: '모집중', start_date: '', end_date: '',
    capacity: 30, description: '', location: '', instructor: '',
  });

  // Load from shared store
  useEffect(() => {
    setPrograms(loadPrograms());
    setApplications(loadApplications());
  }, []);

  // Persist programs to shared store on change
  useEffect(() => {
    if (programs.length > 0) savePrograms(programs);
  }, [programs]);

  // Persist applications to shared store on change
  useEffect(() => {
    if (applications.length > 0) saveApplications(applications);
  }, [applications]);

  const getCategoryColor = (cat) => {
    const colors = { '금융컨설팅': 'primary', '부동산': 'secondary', '창업': 'warning', '사회공헌': 'success', '교육': 'info' };
    return colors[cat] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = { '모집중': 'success', '마감예정': 'warning', '진행중': 'info', '종료': 'default', '승인대기': 'warning', '승인': 'success', '반려': 'error' };
    return colors[status] || 'default';
  };

  const filteredPrograms = programs.filter((p) =>
    !searchTerm || p.title_ko.includes(searchTerm) || p.category.includes(searchTerm)
  );

  const filteredApps = applications.filter((a) =>
    !searchTerm || a.user_name.includes(searchTerm) || a.program_title.includes(searchTerm)
  );

  const handleMenuOpen = (e, item) => { setAnchorEl(e.currentTarget); setSelectedItem(item); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const handleAddNew = () => {
    setEditMode(false);
    setForm({ title_ko: '', category: '금융컨설팅', status: '모집중', start_date: '', end_date: '', capacity: 30, description: '', location: '', instructor: '' });
    setDialogOpen(true);
  };

  const handleView = () => {
    setViewOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    setEditMode(true);
    setForm({
      title_ko: selectedItem.title_ko, category: selectedItem.category, status: selectedItem.status,
      start_date: selectedItem.start_date, end_date: selectedItem.end_date,
      capacity: selectedItem.capacity || 30, description: selectedItem.description || '',
      location: selectedItem.location || '', instructor: selectedItem.instructor || '',
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleSave = () => {
    if (!form.title_ko.trim()) return;
    if (editMode && selectedItem) {
      setPrograms((prev) => prev.map((p) =>
        p.id === selectedItem.id ? { ...p, ...form } : p
      ));
      showSuccess('프로그램이 수정되었습니다');
    } else {
      const newId = Math.max(0, ...programs.map((p) => p.id)) + 1;
      setPrograms((prev) => [...prev, { id: newId, ...form, applicants: 0 }]);
      showSuccess('프로그램이 등록되었습니다');
    }
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (!selectedItem) return;
    setPrograms((prev) => prev.filter((p) => p.id !== selectedItem.id));
    showSuccess('프로그램이 삭제되었습니다');
    setDeleteConfirmOpen(false);
    setSelectedItem(null);
  };

  const handleApprove = (app) => {
    setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, status: '승인' } : a));
    showSuccess(`${app.user_name}님의 신청이 승인되었습니다`);
  };

  const handleReject = (app) => {
    setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, status: '반려' } : a));
    showSuccess(`${app.user_name}님의 신청이 반려되었습니다`);
  };

  // Get applicants for the selected program (for detail view)
  const selectedProgramApplicants = selectedItem
    ? applications.filter((a) => String(a.programId) === String(selectedItem.id))
    : [];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>프로그램 관리</Typography>
          <Typography variant="body2" color="text.secondary">프로그램 및 신청을 관리합니다</Typography>
        </Box>
        {tab === 0 && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>새 프로그램 등록</Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setSearchTerm(''); }}
          sx={{ mb: 3, '& .MuiTab-root': { fontSize: '0.875rem' } }}>
          <Tab label={`프로그램 목록 (${programs.length})`} />
          <Tab label={`신청 관리 (${applications.filter((a) => a.status === '승인대기').length})`} />
        </Tabs>

        <TextField fullWidth placeholder="검색..." value={searchTerm} size="small"
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ mb: 3 }} />

        {tab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>프로그램명</TableCell>
                  <TableCell align="center">분야</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center">기간</TableCell>
                  <TableCell align="center">신청/정원</TableCell>
                  <TableCell align="center" width={60}>관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPrograms.map((program) => {
                  const appCount = applications.filter(
                    (a) => String(a.programId) === String(program.id) && a.status !== '취소' && a.status !== '반려'
                  ).length;
                  const displayApplicants = Math.max(program.applicants || 0, appCount);
                  return (
                    <TableRow key={program.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{program.title_ko}</Typography></TableCell>
                      <TableCell align="center">
                        <Chip label={program.category} size="small" color={getCategoryColor(program.category)} variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={program.status} size="small" color={getStatusColor(program.status)} />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{program.start_date} ~ {program.end_date}</Typography>
                      </TableCell>
                      <TableCell align="center">{displayApplicants}/{program.capacity}명</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, program)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredPrograms.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">프로그램이 없습니다</Typography>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>신청자</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>프로그램</TableCell>
                  <TableCell align="center">신청일</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center">처리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={500}>{app.user_name}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{app.email}</Typography></TableCell>
                    <TableCell>{app.program_title}</TableCell>
                    <TableCell align="center">{app.applied_at}</TableCell>
                    <TableCell align="center">
                      <Chip label={app.status} size="small" color={getStatusColor(app.status)} />
                    </TableCell>
                    <TableCell align="center">
                      {app.status === '승인대기' ? (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Button size="small" variant="contained" color="success" startIcon={<ApproveIcon />}
                            onClick={() => handleApprove(app)} sx={{ fontSize: '0.75rem', minWidth: 0 }}>승인</Button>
                          <Button size="small" variant="outlined" color="error" startIcon={<RejectIcon />}
                            onClick={() => handleReject(app)} sx={{ fontSize: '0.75rem', minWidth: 0 }}>반려</Button>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">처리완료</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '8px', minWidth: 150 } }}>
        <MenuItem onClick={handleView}><ViewIcon fontSize="small" sx={{ mr: 1 }} />상세보기</MenuItem>
        <MenuItem onClick={handleEdit}><EditIcon fontSize="small" sx={{ mr: 1 }} />수정</MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />삭제
        </MenuItem>
      </Menu>

      {/* View Detail Dialog — now includes applicant list */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>프로그램 상세</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">프로그램명</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.title_ko}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">분야</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.category}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">상태</Typography>
                  <Chip label={selectedItem.status} size="small" color={getStatusColor(selectedItem.status)} sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">기간</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.start_date} ~ {selectedItem.end_date}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">정원</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.capacity}명</Typography>
                </Grid>
                {selectedItem.location && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">장소</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.location}</Typography>
                  </Grid>
                )}
                {selectedItem.instructor && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">담당 강사</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.instructor}</Typography>
                  </Grid>
                )}
              </Grid>
              <Typography variant="subtitle2" color="text.secondary">설명</Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>{selectedItem.description || '-'}</Typography>

              <Divider sx={{ my: 2 }} />

              {/* Applicant list for this program */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                신청자 목록 ({selectedProgramApplicants.length}명)
              </Typography>
              {selectedProgramApplicants.length === 0 ? (
                <Typography variant="body2" color="text.secondary">신청자가 없습니다</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>신청자</TableCell>
                        <TableCell>이메일</TableCell>
                        <TableCell align="center">신청일</TableCell>
                        <TableCell align="center">상태</TableCell>
                        <TableCell align="center">처리</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProgramApplicants.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>{app.user_name}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell align="center">{app.applied_at}</TableCell>
                          <TableCell align="center">
                            <Chip label={app.status} size="small" color={getStatusColor(app.status)} />
                          </TableCell>
                          <TableCell align="center">
                            {app.status === '승인대기' ? (
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Button size="small" variant="contained" color="success"
                                  onClick={() => handleApprove(app)} sx={{ fontSize: '0.7rem', minWidth: 0, px: 1 }}>승인</Button>
                                <Button size="small" variant="outlined" color="error"
                                  onClick={() => handleReject(app)} sx={{ fontSize: '0.7rem', minWidth: 0, px: 1 }}>반려</Button>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">처리완료</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewOpen(false)}>닫기</Button></DialogActions>
      </Dialog>

      {/* Add/Edit Dialog — includes capacity, location, instructor */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>{editMode ? '프로그램 수정' : '새 프로그램 등록'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="프로그램명" value={form.title_ko} required
                onChange={(e) => setForm({ ...form, title_ko: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>분야</InputLabel>
                <Select value={form.category} label="분야" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select value={form.status} label="상태" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="정원" type="number" value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                InputProps={{ inputProps: { min: 1 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="시작일" placeholder="YYYY.MM.DD" value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="종료일" placeholder="YYYY.MM.DD" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="장소" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="담당 강사" value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="설명" multiline rows={4} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title_ko.trim()}>
            {editMode ? '수정' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle fontWeight={700}>프로그램 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{selectedItem?.title_ko}" 프로그램을 정말 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>삭제</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramManagement;
