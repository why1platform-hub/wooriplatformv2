import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { programsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const steps = ['프로그램 확인', '신청서 작성', '신청 완료'];

const ProgramApply = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await programsAPI.apply(id, data);
      setActiveStep(2);
      showSuccess('프로그램 신청이 완료되었습니다');
    } catch (error) {
      showError(error.response?.data?.message || '신청에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (activeStep === 2) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Typography variant="h4">✓</Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              신청이 완료되었습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              신청 내역은 '나의 활동 &gt; 신청 내역'에서 확인하실 수 있습니다.
              <br />
              승인 결과는 이메일로 안내드립니다.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={() => navigate('/activities')}>
                신청 내역 보기
              </Button>
              <Button variant="contained" onClick={() => navigate('/programs')}>
                프로그램 목록
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/programs/${id}`)}
        sx={{ mb: 2 }}
      >
        프로그램으로 돌아가기
      </Button>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Application Form */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            신청서 작성
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            신청서 작성 후 담당자 검토를 거쳐 승인 여부가 결정됩니다.
          </Alert>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="지원 동기"
              multiline
              rows={4}
              {...register('motivation', {
                required: '지원 동기를 입력해주세요',
                minLength: {
                  value: 50,
                  message: '최소 50자 이상 입력해주세요',
                },
              })}
              error={!!errors.motivation}
              helperText={errors.motivation?.message || '본 프로그램에 지원하는 이유를 작성해주세요'}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="관련 경력 및 경험"
              multiline
              rows={3}
              {...register('experience')}
              helperText="관련 경력이나 경험이 있다면 작성해주세요 (선택)"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="기대 사항"
              multiline
              rows={2}
              {...register('expectations')}
              helperText="프로그램을 통해 얻고자 하는 것을 작성해주세요 (선택)"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="기타 사항"
              multiline
              rows={2}
              {...register('notes')}
              helperText="담당자에게 전달할 내용이 있으면 작성해주세요 (선택)"
              sx={{ mb: 4 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/programs/${id}`)}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? '제출 중...' : '신청서 제출'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProgramApply;
