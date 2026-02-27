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
        setCourse(response.data.course);
        if (response.data.course.lessons?.length > 0) {
          setCurrentLesson(response.data.course.lessons[0]);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        // Mock data
        const mockCourse = {
          id,
          title: '은퇴 후 스마트한 자산 관리',
          description: '은퇴 후 효과적인 자산 관리 방법과 투자 전략에 대해 알아봅니다. 전문 금융 컨설턴트가 제공하는 실용적인 조언과 사례를 통해 안정적인 노후 생활을 준비하세요.',
          category: '금융',
          instructor: '김재테크',
          total_duration: '2시간 15분',
          views: 1234,
          created_at: '2024.05.15',
          progress: 60,
          lessons: [
            { id: 1, title: '1강. 은퇴 자금 현황 분석', duration: '15:30', completed: true },
            { id: 2, title: '2강. 연금 활용 전략', duration: '18:45', completed: true },
            { id: 3, title: '3강. 투자 포트폴리오 구성', duration: '22:00', completed: false },
            { id: 4, title: '4강. 부동산 자산 관리', duration: '20:15', completed: false },
            { id: 5, title: '5강. 세금 및 상속 계획', duration: '25:00', completed: false },
            { id: 6, title: '6강. Q&A 및 사례 분석', duration: '33:30', completed: false },
          ],
        };
        setCourse(mockCourse);
        setCurrentLesson(mockCourse.lessons[0]);
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
      // Update local state
      if (course) {
        const updatedLessons = course.lessons.map((l) =>
          l.id === currentLesson.id ? { ...l, completed: true } : l
        );
        setCourse({ ...course, lessons: updatedLessons });
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
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
                  <video
                    ref={videoRef}
                    src={currentLesson.video_url}
                    controls
                    style={{ width: '100%', height: '100%' }}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnd}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', color: 'white' }}>
                    <PlayIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h6">
                      {currentLesson?.title || '강의를 선택해주세요'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                      (데모: 실제 영상은 준비 중입니다)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Current Lesson Progress */}
            {currentLesson && (
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
                {course.lessons?.map((lesson, index) => (
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
                              textDecoration: lesson.completed ? 'none' : 'none',
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
