import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { jobsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const JobCard = ({ job, onBookmark }) => {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(job.is_bookmarked || false);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    try {
      if (bookmarked) {
        await jobsAPI.removeBookmark(job.id);
      } else {
        await jobsAPI.bookmark(job.id);
      }
      setBookmarked(!bookmarked);
      if (onBookmark) onBookmark(job.id, !bookmarked);
    } catch (error) {
      console.error('Bookmark failed:', error);
    }
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {job.company}
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              {job.title || job.title_ko}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {job.location}
                </Typography>
              </Box>
              <Chip label={job.employment_type} size="small" variant="outlined" />
            </Box>
            <Typography variant="body2" color="primary" fontWeight={500}>
              {job.salary_range}
            </Typography>
            {job.requirements && (
              <Box sx={{ mt: 1 }}>
                {job.requirements.slice(0, 2).map((req, index) => (
                  <Typography key={index} variant="caption" color="text.secondary" display="block">
                    - {req}
                  </Typography>
                ))}
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              등록일: {job.posted_date || job.created_at}
            </Typography>
          </Box>
          <IconButton onClick={handleBookmark}>
            {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/jobs/${job.id}`);
          }}
        >
          지원하기
        </Button>
      </CardContent>
    </Card>
  );
};

const JobList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess } = useNotification();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    region: [],
    employmentType: [],
    field: [],
  });

  const regions = ['서울', '경기', '전국'];
  const employmentTypes = ['정규직', '계약직', '프리랜서'];
  const fields = ['금융', '부동산', '컨설팅', '사회공헌', '기타'];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobsAPI.getAll();
        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Mock data
  const mockJobs = [
    {
      id: 1,
      company: '우리은행',
      title_ko: '시니어 금융 컨설턴트',
      location: '서울 중구',
      employment_type: '계약직',
      salary_range: '연봉 5,000만원 ~ 6,000만원 (협의가능)',
      requirements: ['금융권 경력 15년 이상', '자산관리 및 투자 상담 경험 우대'],
      posted_date: '2024.05.20',
      is_bookmarked: false,
    },
    {
      id: 2,
      company: '삼성생명',
      title_ko: '퇴직연금 전문 상담역',
      location: '서울 강남구',
      employment_type: '정규직',
      salary_range: '협의 후 결정',
      requirements: ['퇴직연금 관련 자격증 소지자', '법인 및 개인 고객 상담 능력 필수'],
      posted_date: '2024.05.19',
      is_bookmarked: true,
    },
    {
      id: 3,
      company: '현대건설',
      title_ko: '부동산 자문위원',
      location: '경기 성남시',
      employment_type: '프리랜서',
      salary_range: '프로젝트별 협의',
      requirements: ['부동산 개발 및 투자 분석 경력 10년 이상', '관련 네트워크 보유자 우대'],
      posted_date: '2024.05.18',
      is_bookmarked: false,
    },
    {
      id: 4,
      company: '서울시 사회공헌센터',
      title_ko: '시니어 사회공헌 프로젝트 매니저',
      location: '서울 여의도',
      employment_type: '계약직',
      salary_range: '월급 350만원 (협의가능)',
      requirements: ['비영리 단체 또는 사회공헌 활동 경험', '프로젝트 기획 및 운영 능력 우수자'],
      posted_date: '2024.05.17',
      is_bookmarked: false,
    },
  ];

  const displayJobs = jobs.length > 0 ? jobs : mockJobs;

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4, py: 4, backgroundColor: '#0047BA', mx: -3, mt: -3, px: 3 }}>
        <Typography variant="h4" fontWeight={700} color="white" sx={{ mb: 1 }}>
          {t('jobs.title')}
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.8)">
          {t('jobs.subtitle')}
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('jobs.searchPlaceholder')}
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

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
            {t('jobs.region')}:
          </Typography>
          {regions.map((region) => (
            <Chip
              key={region}
              label={region}
              variant={filters.region.includes(region) ? 'filled' : 'outlined'}
              onClick={() => toggleFilter('region', region)}
              sx={{ cursor: 'pointer' }}
            />
          ))}

          <Typography variant="body2" sx={{ ml: 2, mr: 1, alignSelf: 'center' }}>
            {t('jobs.employmentType')}:
          </Typography>
          {employmentTypes.map((type) => (
            <Chip
              key={type}
              label={type}
              variant={filters.employmentType.includes(type) ? 'filled' : 'outlined'}
              onClick={() => toggleFilter('employmentType', type)}
              sx={{ cursor: 'pointer' }}
            />
          ))}

          <Typography variant="body2" sx={{ ml: 2, mr: 1, alignSelf: 'center' }}>
            {t('jobs.field')}:
          </Typography>
          {fields.map((field) => (
            <Chip
              key={field}
              label={field}
              variant={filters.field.includes(field) ? 'filled' : 'outlined'}
              onClick={() => toggleFilter('field', field)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Job Cards */}
        <Grid item xs={12} lg={9}>
          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {displayJobs.map((job) => (
                <Grid item xs={12} sm={6} key={job.id}>
                  <JobCard job={job} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={3}>
          {/* My Favorites */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {t('jobs.myFavorites')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ p: 1.5, backgroundColor: '#F8F9FA', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    시니어 금융 컨설턴트
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (우리은행)
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, backgroundColor: '#F8F9FA', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    퇴직연금 전문 상담역
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (삼성생명)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Resume Management */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<WorkIcon />}
            onClick={() => navigate('/jobs/resume')}
            sx={{ mb: 2 }}
          >
            {t('jobs.manageResume')}
          </Button>

          {/* Custom Alerts */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => showSuccess('알림 설정이 저장되었습니다')}
          >
            {t('jobs.customAlerts')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobList;
