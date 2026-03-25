import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayCircle as PlayIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { coursesAPI } from '../../services/api';
import CategoryBadge from '../../components/common/CategoryBadge';

// Helper: detect video source type
const getVideoType = (url) => {
  if (!url) return 'none';
  if (url.match(/youtube\.com\/watch|youtube\.com\/shorts\/|youtu\.be\//)) return 'youtube';
  if (url.match(/vimeo\.com\//)) return 'vimeo';
  return 'direct';
};

// Helper: extract YouTube video ID (supports watch, shorts, and youtu.be)
const getYouTubeId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([^&\s?]+)/);
  return match ? match[1] : null;
};

// Helper: extract Vimeo video ID
const getVimeoId = (url) => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

// Embeddable video component that handles YouTube, Vimeo, and direct video URLs
const VideoEmbed = ({ url, videoRef, onTimeUpdate, onEnded, title }) => {
  const type = getVideoType(url);

  if (type === 'youtube') {
    const videoId = getYouTubeId(url);
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title || 'Video'}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (type === 'vimeo') {
    const videoId = getVimeoId(url);
    return (
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0`}
        title={title || 'Video'}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Direct video file (mp4, etc.)
  return (
    <video
      ref={videoRef}
      src={url}
      controls
      style={{ width: '100%', height: '100%' }}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
    />
  );
};


const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await coursesAPI.getById(id);
        const courseData = response.data.course;
        setCourse(courseData);
        if (courseData.lessons?.length > 0) {
          setCurrentLesson(courseData.lessons[0]);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleLessonClick = (lesson) => {
    setCurrentLesson(lesson);
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  const handleVideoEnd = async () => {
    try {
      await coursesAPI.updateProgress(id, {
        lesson_id: currentLesson.id,
        completed: true,
      });
    } catch (error) {
      // Silently handle - update local state anyway
    }
    // Update local state
    if (course) {
      const updatedLessons = course.lessons.map((l) =>
        l.id === currentLesson.id ? { ...l, completed: true } : l
      );
      setCourse({ ...course, lessons: updatedLessons });
    }
  };

  const completedCount = course?.lessons?.filter((l) => l.completed).length || 0;
  const totalCount = course?.lessons?.length || 0;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          강의를 찾을 수 없습니다
        </Typography>
        <Button onClick={() => navigate('/learning')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  const videoType = currentLesson?.video_url ? getVideoType(currentLesson.video_url) : 'none';
  const isEmbedded = videoType === 'youtube' || videoType === 'vimeo';

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/learning')}
        sx={{ mb: 2 }}
      >
        학습자료실로 돌아가기
      </Button>

      <Grid container spacing={3}>
        {/* Video Player */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            {/* Video Container */}
            <Box
              sx={{
                position: 'relative',
                backgroundColor: '#000',
                paddingTop: '56.25%', // 16:9 aspect ratio
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentLesson?.video_url ? (
                  <VideoEmbed
                    url={currentLesson.video_url}
                    videoRef={videoRef}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnd}
                    title={currentLesson.title}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', color: 'white' }}>
                    <PlayIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h6">
                      {currentLesson?.title || '강의를 선택해주세요'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                      (영상이 등록되지 않았습니다)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Current Lesson Progress - only for direct video */}
            {currentLesson && !isEmbedded && (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 4 }}
              />
            )}

            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CategoryBadge category={course.category} />
                <Typography variant="caption" color="text.secondary">
                  {course.instructor}
                </Typography>
              </Box>

              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                {course.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {course.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    총 {course.total_duration}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ViewIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {course.views?.toLocaleString()}회 시청
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lesson List */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                강의 목록
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    전체 진도율
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {overallProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={overallProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {completedCount} / {totalCount} 강의 완료
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List disablePadding>
                {course.lessons?.map((lesson) => (
                  <ListItem key={lesson.id} disablePadding>
                    <ListItemButton
                      selected={currentLesson?.id === lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(0, 71, 186, 0.08)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {lesson.completed ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <PlayIcon color="action" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontWeight={currentLesson?.id === lesson.id ? 600 : 400}
                            sx={{
                              color: lesson.completed ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {lesson.title}
                          </Typography>
                        }
                        secondary={lesson.duration}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              {overallProgress === 100 && (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    window.print();
                  }}
                >
                  수료증 발급
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VideoPlayer;
