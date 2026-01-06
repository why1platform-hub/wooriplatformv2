import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Skeleton,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayCircleOutline as PlayIcon,
  Download as DownloadIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { coursesAPI } from '../../services/api';
import CategoryBadge from '../../components/common/CategoryBadge';

const VideoCard = ({ video, onClick }) => {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: 'relative',
          height: 160,
          backgroundColor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {video.thumbnail ? (
          <Box
            component="img"
            src={video.thumbnail}
            alt={video.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <PlayIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.7)' }} />
        )}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
          }}
        >
          <CategoryBadge category={video.category} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
          }}
        >
          {video.duration}
        </Box>
      </Box>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }} noWrap>
          {video.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ViewIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {video.views?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {video.created_at}
            </Typography>
          </Box>
        </Box>
        {video.progress !== undefined && video.progress > 0 && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={video.progress}
              sx={{ height: 4, borderRadius: 2 }}
            />
            <Typography variant="caption" color="text.secondary">
              {video.progress}% 완료
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const DownloadItem = ({ item }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <PdfIcon sx={{ color: '#E53935' }} />;
      case 'doc':
      case 'docx':
        return <DocIcon sx={{ color: '#1976D2' }} />;
      case 'xls':
      case 'xlsx':
        return <ExcelIcon sx={{ color: '#43A047' }} />;
      default:
        return <DocIcon color="action" />;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        border: '1px solid #E5E5E5',
        borderRadius: 1,
        mb: 1,
        '&:hover': {
          backgroundColor: '#F8F9FA',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {getIcon(item.file_type)}
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.file_size} · {item.download_count}회 다운로드
          </Typography>
        </Box>
      </Box>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={() => window.open(item.file_url, '_blank')}
      >
        다운로드
      </Button>
    </Box>
  );
};

const LearningMaterials = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const categories = ['전체', '금융컨설팅', '부동산', '창업', '사회공헌', '기타'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 0) {
          const response = await coursesAPI.getAll();
          setVideos(response.data.courses || []);
        } else {
          const response = await coursesAPI.getMaterials();
          setMaterials(response.data.materials || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab]);

  // Mock data
  const mockVideos = [
    {
      id: 1,
      title: '은퇴 후 스마트한 자산 관리',
      category: '금융',
      duration: '45:30',
      views: 1234,
      created_at: '2024.05.15',
      progress: 60,
    },
    {
      id: 2,
      title: '성공적인 부동산 투자 전략',
      category: '부동산',
      duration: '38:15',
      views: 892,
      created_at: '2024.05.10',
      progress: 50,
    },
    {
      id: 3,
      title: '시니어 창업 성공 사례',
      category: '창업',
      duration: '52:00',
      views: 567,
      created_at: '2024.05.08',
      progress: 0,
    },
    {
      id: 4,
      title: '사회공헌 활동 시작하기',
      category: '사회공헌',
      duration: '28:45',
      views: 423,
      created_at: '2024.05.05',
      progress: 100,
    },
    {
      id: 5,
      title: '디지털 금융 활용법',
      category: '금융',
      duration: '35:20',
      views: 756,
      created_at: '2024.05.01',
      progress: 0,
    },
    {
      id: 6,
      title: '은퇴 후 건강관리',
      category: '기타',
      duration: '42:10',
      views: 634,
      created_at: '2024.04.28',
      progress: 30,
    },
  ];

  const mockMaterials = [
    {
      id: 1,
      title: '은퇴자 자산관리 가이드북',
      file_type: 'pdf',
      file_size: '2.5MB',
      download_count: 324,
      category: '금융',
    },
    {
      id: 2,
      title: '부동산 투자 체크리스트',
      file_type: 'xlsx',
      file_size: '156KB',
      download_count: 198,
      category: '부동산',
    },
    {
      id: 3,
      title: '창업 사업계획서 템플릿',
      file_type: 'docx',
      file_size: '89KB',
      download_count: 276,
      category: '창업',
    },
    {
      id: 4,
      title: '퇴직연금 세금 가이드',
      file_type: 'pdf',
      file_size: '1.8MB',
      download_count: 412,
      category: '금융',
    },
  ];

  const displayVideos = videos.length > 0 ? videos : mockVideos;
  const displayMaterials = materials.length > 0 ? materials : mockMaterials;

  const filteredVideos = displayVideos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredMaterials = displayMaterials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Recent learning for sidebar
  const recentLearning = displayVideos
    .filter((v) => v.progress > 0 && v.progress < 100)
    .slice(0, 3);

  // Popular materials for sidebar
  const popularMaterials = [...displayMaterials]
    .sort((a, b) => b.download_count - a.download_count)
    .slice(0, 3);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          {t('learning.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('learning.subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={9}>
          <Card>
            <CardContent>
              {/* Tabs */}
              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                sx={{ mb: 3, borderBottom: '1px solid #E5E5E5' }}
              >
                <Tab label={t('learning.onlineCourses')} />
                <Tab label={t('learning.downloadMaterials')} />
              </Tabs>

              {/* Search and Filters */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder={t('learning.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      variant={selectedCategory === category ? 'filled' : 'outlined'}
                      onClick={() => setSelectedCategory(category)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Content */}
              {loading ? (
                <Grid container spacing={2}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <>
                  {/* Online Courses */}
                  {tab === 0 && (
                    <Grid container spacing={2}>
                      {filteredVideos.length === 0 ? (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography color="text.secondary">
                              검색 결과가 없습니다
                            </Typography>
                          </Box>
                        </Grid>
                      ) : (
                        filteredVideos.map((video) => (
                          <Grid item xs={12} sm={6} md={4} key={video.id}>
                            <VideoCard
                              video={video}
                              onClick={() => navigate(`/learning/video/${video.id}`)}
                            />
                          </Grid>
                        ))
                      )}
                    </Grid>
                  )}

                  {/* Download Materials */}
                  {tab === 1 && (
                    <Box>
                      {filteredMaterials.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">
                            검색 결과가 없습니다
                          </Typography>
                        </Box>
                      ) : (
                        filteredMaterials.map((material) => (
                          <DownloadItem key={material.id} item={material} />
                        ))
                      )}
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={3}>
          {/* Recent Learning */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {t('learning.recentLearning')}
              </Typography>
              {recentLearning.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  진행 중인 학습이 없습니다
                </Typography>
              ) : (
                recentLearning.map((video) => (
                  <Box
                    key={video.id}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      backgroundColor: '#F8F9FA',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#EEEEEE' },
                    }}
                    onClick={() => navigate(`/learning/video/${video.id}`)}
                  >
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {video.title}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={video.progress}
                      sx={{ height: 4, borderRadius: 2, my: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {video.progress}% 완료
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>

          {/* Popular Materials */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {t('learning.popularMaterials')}
              </Typography>
              {popularMaterials.map((material, index) => (
                <Box
                  key={material.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderBottom: index < popularMaterials.length - 1 ? '1px solid #E5E5E5' : 'none',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#0047BA' : '#E5E5E5',
                      color: index === 0 ? 'white' : '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" noWrap>
                      {material.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {material.download_count}회 다운로드
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LearningMaterials;
