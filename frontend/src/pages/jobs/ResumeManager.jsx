import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { resumesAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

const ResumeManager = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResume, setEditingResume] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await resumesAPI.getAll();
      setResumes(response.data.resumes || []);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      // Mock data
      setResumes([
        {
          id: 1,
          title: '금융 전문가 이력서',
          is_primary: true,
          updated_at: '2024.05.20',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (resume = null) => {
    setEditingResume(resume);
    if (resume) {
      reset({
        title: resume.title,
        summary: resume.content?.summary || '',
        experience: resume.content?.experience || '',
        skills: resume.content?.skills?.join(', ') || '',
        education: resume.content?.education || '',
      });
    } else {
      reset({
        title: '',
        summary: '',
        experience: '',
        skills: '',
        education: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingResume(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const resumeData = {
        title: data.title,
        content: {
          summary: data.summary,
          experience: data.experience,
          skills: data.skills.split(',').map((s) => s.trim()).filter(Boolean),
          education: data.education,
        },
      };

      if (editingResume) {
        await resumesAPI.update(editingResume.id, resumeData);
        showSuccess('이력서가 수정되었습니다');
      } else {
        await resumesAPI.create(resumeData);
        showSuccess('이력서가 생성되었습니다');
      }

      handleCloseDialog();
      fetchResumes();
    } catch (error) {
      showError('저장에 실패했습니다');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이력서를 삭제하시겠습니까?')) return;

    try {
      await resumesAPI.delete(id);
      setResumes(resumes.filter((r) => r.id !== id));
      showSuccess('이력서가 삭제되었습니다');
    } catch (error) {
      showError('삭제에 실패했습니다');
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await resumesAPI.setPrimary(id);
      setResumes(resumes.map((r) => ({
        ...r,
        is_primary: r.id === id,
      })));
      showSuccess('대표 이력서가 변경되었습니다');
    } catch (error) {
      showError('변경에 실패했습니다');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/jobs')}
          sx={{ mb: 2 }}
        >
          채용정보로 돌아가기
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={700}>
            {t('jobs.resumeManagement')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            새 이력서 작성
          </Button>
        </Box>
      </Box>

      {/* Resume List */}
      {loading ? (
        <Typography>로딩 중...</Typography>
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              등록된 이력서가 없습니다
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              이력서 작성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {resumes.map((resume) => (
            <Grid item xs={12} sm={6} md={4} key={resume.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {resume.title}
                        </Typography>
                        {resume.is_primary && (
                          <Chip label="대표" size="small" color="primary" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        최종 수정: {resume.updated_at}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleSetPrimary(resume.id)}
                      color={resume.is_primary ? 'primary' : 'default'}
                    >
                      {resume.is_primary ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(resume)}
                    >
                      수정
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(resume.id)}
                    >
                      삭제
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Resume Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingResume ? '이력서 수정' : '새 이력서 작성'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="이력서 제목"
              {...register('title', { required: '제목을 입력해주세요' })}
              error={!!errors.title}
              helperText={errors.title?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="자기소개"
              multiline
              rows={3}
              {...register('summary')}
              helperText="간단한 자기소개를 작성해주세요"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="경력사항"
              multiline
              rows={4}
              {...register('experience')}
              helperText="주요 경력을 작성해주세요"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="보유 스킬"
              {...register('skills')}
              helperText="쉼표로 구분하여 입력해주세요 (예: 자산관리, 투자상담, 리스크관리)"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="학력/자격증"
              multiline
              rows={2}
              {...register('education')}
              helperText="학력 및 자격증 정보를 입력해주세요"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            {editingResume ? '수정' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeManager;
