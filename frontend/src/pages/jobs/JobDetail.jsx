import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import { jobsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobsAPI.getById(id);
        setJob(response.data.job);
        setBookmarked(response.data.job.is_bookmarked);
      } catch (error) {
        console.error('Failed to fetch job:', error);
        // Mock data
        setJob({
          id,
          company: '우리은행',
          title_ko: '시니어 금융 컨설턴트',
          title_en: 'Senior Financial Consultant',
          location: '서울 중구',
          employment_type: '계약직',
          salary_range: '연봉 5,000만원 ~ 6,000만원 (협의가능)',
          description: `우리은행에서 시니어 금융 컨설턴트를 모집합니다.

주요 업무:
- 고객 자산관리 상담 및 컨설팅
- 투자 포트폴리오 분석 및 추천
- VIP 고객 관리 및 관계 유지
- 금융상품 설명 및 판매

자격요건:
- 금융권 경력 15년 이상
- 자산관리 및 투자 상담 경험 우대
- 관련 자격증 보유자 우대 (CFP, AFPK 등)

우대사항:
- 우리은행 퇴직자 우대
- 고객 네트워크 보유자 우대
- 금융상품 판매 실적 우수자`,
          requirements: [
            '금융권 경력 15년 이상',
            '자산관리 및 투자 상담 경험',
            '관련 자격증 보유자 우대 (CFP, AFPK 등)',
          ],
          benefits: [
            '유연근무제',
            '4대보험',
            '경조금 지원',
            '자기계발비 지원',
          ],
          contact: '인사담당자 02-2002-3000',
          posted_date: '2024.05.20',
          deadline: '2024.06.20',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await jobsAPI.removeBookmark(id);
        showSuccess('관심 채용에서 삭제되었습니다');
      } else {
        await jobsAPI.bookmark(id);
        showSuccess('관심 채용에 추가되었습니다');
      }
      setBookmarked(!bookmarked);
    } catch (error) {
      showError('처리에 실패했습니다');
    }
  };

  const handleApply = () => {
    if (job.external_url) {
      window.open(job.external_url, '_blank');
    } else {
      navigate(`/jobs/${id}/apply`);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          채용 정보를 찾을 수 없습니다
        </Typography>
        <Button onClick={() => navigate('/jobs')} sx={{ mt: 2 }}>
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
        onClick={() => navigate('/jobs')}
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
                <Typography variant="caption" color="text.secondary">
                  {job.company}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                  {job.title_ko || job.title}
                </Typography>
                {job.title_en && (
                  <Typography variant="body2" color="text.secondary">
                    {job.title_en}
                  </Typography>
                )}
              </Box>

              {/* Quick Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        근무지
                      </Typography>
                      <Typography variant="body2">{job.location}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        고용형태
                      </Typography>
                      <Typography variant="body2">{job.employment_type}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        급여
                      </Typography>
                      <Typography variant="body2">{job.salary_range}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        마감일
                      </Typography>
                      <Typography variant="body2">{job.deadline}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                상세 내용
              </Typography>
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, mb: 3 }}
              >
                {job.description}
              </Typography>

              {/* Requirements */}
              {job.requirements && (
                <>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    자격요건
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {job.requirements.map((req, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        • {req}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}

              {/* Benefits */}
              {job.benefits && (
                <>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    복리후생
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {job.benefits.map((benefit, index) => (
                      <Chip key={index} label={benefit} variant="outlined" />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                지원하기
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  등록일: {job.posted_date}
                </Typography>
                <Typography variant="body2" color="error">
                  마감일: {job.deadline}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleApply}
                sx={{ mb: 2 }}
              >
                지원하기
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={handleBookmark}
              >
                {bookmarked ? '관심 해제' : '관심 등록'}
              </Button>

              {job.contact && (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #E5E5E5' }}>
                  <Typography variant="body2" color="text.secondary">
                    문의: {job.contact}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDetail;
