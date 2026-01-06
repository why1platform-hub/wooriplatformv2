import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { jobsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const Favorites = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess } = useNotification();

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await jobsAPI.getBookmarks();
        setFavorites(response.data.bookmarks || []);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        // Mock data
        setFavorites([
          {
            id: 1,
            company: '우리은행',
            title_ko: '시니어 금융 컨설턴트',
            location: '서울 중구',
            employment_type: '계약직',
            deadline: '2024.06.20',
          },
          {
            id: 2,
            company: '삼성생명',
            title_ko: '퇴직연금 전문 상담역',
            location: '서울 강남구',
            employment_type: '정규직',
            deadline: '2024.06.15',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemove = async (id) => {
    try {
      await jobsAPI.removeBookmark(id);
      setFavorites(favorites.filter((f) => f.id !== id));
      showSuccess('관심 채용에서 삭제되었습니다');
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
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
        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookmarkIcon color="primary" />
          {t('jobs.favorites')}
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      ) : favorites.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <BookmarkIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              저장된 관심 채용이 없습니다
            </Typography>
            <Button variant="contained" onClick={() => navigate('/jobs')}>
              채용정보 둘러보기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {favorites.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box
                      sx={{ cursor: 'pointer', flex: 1 }}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {job.company}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {job.title_ko || job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.location} · {job.employment_type}
                      </Typography>
                      <Typography variant="caption" color="error">
                        마감: {job.deadline}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(job.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    상세보기
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Favorites;
