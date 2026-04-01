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
import { getJobById, isBookmarked as checkBookmark, toggleBookmark } from '../../utils/jobStore';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useNotification();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [bookmarked, setBookmarked] = useState(() => checkBookmark(id));

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobsAPI.getById(id);
        setJob(response.data.job);
        setBookmarked(response.data.job.is_bookmarked);
      } catch {
        // Use shared mock data matched by ID
        const mockJob = getJobById(id);
        setJob(mockJob);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Sync bookmark state when navigating between jobs
  useEffect(() => {
    setBookmarked(checkBookmark(id));
  }, [id]);

  const handleBookmark = () => {
    const newState = toggleBookmark(id);
    setBookmarked(newState);
    showSuccess(newState ? '관심 채용에 추가되었습니다' : '관심 채용에서 삭제되었습니다');
  };

  const handleApply = () => {
    showSuccess('지원이 완료되었습니다. 결과는 이메일로 안내드리겠습니다.');
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
