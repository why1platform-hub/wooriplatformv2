import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { jobsAPI } from '../../services/api';
import { MOCK_JOBS, isBookmarked as checkBookmark, toggleBookmark } from '../../utils/jobStore';

const JobCard = ({ job, onBookmark }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bookmarked, setBookmarked] = useState(() => checkBookmark(job.id));

  // Re-sync bookmark state from localStorage on every mount/navigation
  useEffect(() => {
    setBookmarked(checkBookmark(job.id));
  }, [job.id]);

  const handleBookmark = (e) => {
    e.stopPropagation();
    const newState = toggleBookmark(job.id);
    setBookmarked(newState);
    if (onBookmark) onBookmark(job.id, newState);
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
              {t('jobs.postedDate')}: {job.posted_date || job.created_at}
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
          {t('jobs.applyJob')}
        </Button>
      </CardContent>
    </Card>
  );
};

const JobList = () => {
  const { t } = useTranslation();

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

  const displayJobs = jobs.length > 0 ? jobs : MOCK_JOBS;

  const handleBookmarkChange = () => {};

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

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {displayJobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job.id}>
              <JobCard job={job} onBookmark={handleBookmarkChange} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default JobList;
