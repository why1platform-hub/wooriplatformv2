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

// Mock courses fallback when backend is unavailable
const MOCK_COURSES = [
  {
    id: 'mock-1',
    title: '디지털 금융 트렌드 2026',
    category: '금융컨설팅',
    duration: '45:00',
    views: 1234,
    created_at: '2026.03.15',
    thumbnail: '',
    progress: 0,
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'mock-2',
    title: '시니어를 위한 AI 활용법',
    category: '기타',
    duration: '38:20',
    views: 892,
    created_at: '2026.03.10',
    thumbnail: '',
    progress: 0,
    video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  },
  {
    id: 'mock-3',
    title: '부동산 투자 기초 가이드',
    category: '부동산',
    duration: '52:10',
    views: 2156,
    created_at: '2026.02.28',
    thumbnail: '',
    progress: 30,
    video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
  },
  {
    id: 'mock-4',
    title: '성공적인 창업 전략',
    category: '창업',
    duration: '41:30',
    views: 1567,
    created_at: '2026.02.20',
    thumbnail: '',
    progress: 0,
    video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
  },
  {
    id: 'mock-5',
    title: '자산관리와 은퇴 설계',
    category: '금융컨설팅',
    duration: '35:45',
    views: 3421,
    created_at: '2026.02.15',
    thumbnail: '',
    progress: 65,
    video_url: 'https://www.youtube.com/watch?v=RgKAFK5djSk',
  },
  {
    id: 'mock-6',
    title: '사회공헌 활동 시작하기',
    category: '사회공헌',
    duration: '28:15',
    views: 678,
    created_at: '2026.02.10',
    thumbnail: '',
    progress: 0,
    video_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
  },
];

const MOCK_MATERIALS = [
  { id: 'mat-1', title: '2026 은퇴설계 가이드북', category: '금융컨설팅', file_type: 'pdf', file_size: '2.4MB', download_count: 456, file_url: '#' },
  { id: 'mat-2', title: '부동산 투자 체크리스트', category: '부동산', file_type: 'xlsx', file_size: '1.1MB', download_count: 312, file_url: '#' },
  { id: 'mat-3', title: '창업 사업계획서 템플릿', category: '창업', file_type: 'docx', file_size: '890KB', download_count: 234, file_url: '#' },
];

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
          const courses = response.data.courses || [];
          setVideos(courses.length > 0 ? courses : MOCK_COURSES);
        } else {
          const response = await coursesAPI.getMaterials();
          const mats = response.data.materials || [];
          setMaterials(mats.length > 0 ? mats : MOCK_MATERIALS);
        }
      } catch {
        // Backend unavailable — use mock data
        if (tab === 0) {
          setVideos(MOCK_COURSES);
        } else {
          setMaterials(MOCK_MATERIALS);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab]);

  const displayVideos = videos;
  const displayMaterials = materials;

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
                              onClick={() => navigate(`/learning/${video.id}`)}
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
                    onClick={() => navigate(`/learning/${video.id}`)}
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
