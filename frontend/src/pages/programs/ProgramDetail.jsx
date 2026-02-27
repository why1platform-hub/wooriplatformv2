import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { programsAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await programsAPI.getById(id);
        setProgram(response.data.program);
      } catch (error) {
        console.error('Failed to fetch program:', error);
        // Use mock data on error
        setProgram({
          id,
          title_ko: '은퇴 후 자산 관리 심화 과정',
          title_en: 'Advanced Asset Management After Retirement',
          category: '금융컨설팅',
          status: '모집중',
          description_ko: `본 과정은 은퇴를 앞두고 있거나 이미 은퇴한 분들을 위한 자산 관리 심화 프로그램입니다.

주요 내용:
- 은퇴 후 소득 원천 다변화 전략
- 부동산 및 금융자산 포트폴리오 관리
- 세금 최적화 및 상속 계획
- 안정적인 현금흐름 창출 방법

본 과정을 통해 은퇴 후에도 안정적인 재무 생활을 영위할 수 있는 역량을 키울 수 있습니다.`,
          recruitment_start: '2026-01-05',
          recruitment_end: '2026-01-25',
          program_start: '2026-02-01',
          program_end: '2026-02-28',
          location: '우리은행 본점 교육관',
          max_participants: 30,
          current_participants: 12,
          instructor: '김재무 전문위원',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!program) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          프로그램을 찾을 수 없습니다
        </Typography>
        <Button onClick={() => navigate('/programs')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/programs')}
        sx={{ mb: 2 }}
      >
        목록으로
      </Button>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <CategoryBadge category={program.category} />
                  <StatusBadge status={program.status} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {program.title_ko || program.title}
                </Typography>
                {program.title_en && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {program.title_en}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Program Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        모집 기간
                      </Typography>
                      <Typography variant="body2">
                        {program.recruitment_start} ~ {program.recruitment_end}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        프로그램 기간
                      </Typography>
                      <Typography variant="body2">
                        {program.program_start} ~ {program.program_end}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        장소
                      </Typography>
                      <Typography variant="body2">
                        {program.location || '온라인'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        담당 강사
                      </Typography>
                      <Typography variant="body2">
                        {program.instructor || '미정'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                프로그램 소개
              </Typography>
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}
              >
                {program.description_ko || program.description || '상세 설명이 없습니다.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                신청 현황
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <GroupIcon color="action" />
                <Typography variant="body2">
                  {program.current_participants || 0} / {program.max_participants || 30}명 신청
                </Typography>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    height: 8,
                    backgroundColor: '#E5E5E5',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${((program.current_participants || 0) / (program.max_participants || 30)) * 100}%`,
                      backgroundColor: '#0047BA',
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={program.status === '종료'}
                onClick={() => navigate(`/programs/${id}/apply`)}
              >
                {program.status === '종료' ? '모집 마감' : '신청하기'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgramDetail;
