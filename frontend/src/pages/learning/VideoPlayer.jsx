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

// Mock course detail fallback when backend is unavailable
const MOCK_COURSE_MAP = {
  'mock-1': {
    id: 'mock-1', title: '디지털 금융 트렌드 2026', category: '금융컨설팅',
    instructor: '김재현 컨설턴트', description: '2026년 디지털 금융의 최신 트렌드를 알아봅니다. AI 기반 자산관리, 블록체인 금융, 디지털 뱅킹의 미래를 심도 있게 다룹니다.',
    total_duration: '45분', views: 1234,
    lessons: [
      { id: 'l1', title: '1강. 디지털 금융 개요', duration: '15:00', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completed: false },
      { id: 'l2', title: '2강. AI 기반 자산관리', duration: '15:00', video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', completed: false },
      { id: 'l3', title: '3강. 디지털 뱅킹의 미래', duration: '15:00', video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0', completed: false },
    ],
  },
  'mock-2': {
    id: 'mock-2', title: '시니어를 위한 AI 활용법', category: '기타',
    instructor: '박지영 컨설턴트', description: '시니어 세대를 위한 AI 활용 가이드입니다. ChatGPT, 이미지 생성 AI 등 실생활에 유용한 AI 도구들을 배워봅니다.',
    total_duration: '38분', views: 892,
    lessons: [
      { id: 'l1', title: '1강. AI란 무엇인가?', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', completed: false },
      { id: 'l2', title: '2강. ChatGPT 활용하기', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', completed: false },
      { id: 'l3', title: '3강. AI 이미지 생성', duration: '13:20', video_url: 'https://www.youtube.com/watch?v=RgKAFK5djSk', completed: false },
    ],
  },
  'mock-3': {
    id: 'mock-3', title: '부동산 투자 기초 가이드', category: '부동산',
    instructor: '이민호 컨설턴트', description: '부동산 투자의 기본부터 실전까지. 시니어를 위한 안정적인 부동산 투자 전략을 배웁니다.',
    total_duration: '52분', views: 2156,
    lessons: [
      { id: 'l1', title: '1강. 부동산 시장 이해', duration: '17:00', video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0', completed: false },
      { id: 'l2', title: '2강. 투자 유형별 분석', duration: '18:00', video_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8', completed: false },
      { id: 'l3', title: '3강. 리스크 관리', duration: '17:10', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completed: false },
    ],
  },
  'mock-4': {
    id: 'mock-4', title: '성공적인 창업 전략', category: '창업',
    instructor: '김재현 컨설턴트', description: '시니어 창업의 A to Z. 아이디어 발굴부터 사업 계획, 자금 확보까지 성공적인 창업을 위한 모든 것을 다룹니다.',
    total_duration: '41분', views: 1567,
    lessons: [
      { id: 'l1', title: '1강. 창업 아이디어 발굴', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', completed: false },
      { id: 'l2', title: '2강. 사업 계획서 작성', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=RgKAFK5djSk', completed: false },
      { id: 'l3', title: '3강. 자금 확보 전략', duration: '13:30', video_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8', completed: false },
    ],
  },
  'mock-5': {
    id: 'mock-5', title: '자산관리와 은퇴 설계', category: '금융컨설팅',
    instructor: '박지영 컨설턴트', description: '체계적인 자산관리와 은퇴 설계 방법을 배웁니다. 연금, 투자, 보험 등 종합적인 재무 설계를 다룹니다.',
    total_duration: '35분', views: 3421,
    lessons: [
      { id: 'l1', title: '1강. 은퇴 자금 계획', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=RgKAFK5djSk', completed: false },
      { id: 'l2', title: '2강. 연금과 보험 설계', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completed: false },
      { id: 'l3', title: '3강. 투자 포트폴리오', duration: '11:45', video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', completed: false },
    ],
  },
  'mock-6': {
    id: 'mock-6', title: '사회공헌 활동 시작하기', category: '사회공헌',
    instructor: '이민호 컨설턴트', description: '은퇴 후 보람찬 사회공헌 활동을 시작하는 방법을 안내합니다.',
    total_duration: '28분', views: 678,
    lessons: [
      { id: 'l1', title: '1강. 사회공헌 분야 탐색', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8', completed: false },
      { id: 'l2', title: '2강. 봉사활동 참여하기', duration: '14:15', video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0', completed: false },
    ],
  },
};

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
        if (courseData) {
          setCourse(courseData);
          if (courseData.lessons?.length > 0) {
            setCurrentLesson(courseData.lessons[0]);
          }
        } else {
          throw new Error('No course data');
        }
      } catch {
        // Backend unavailable — use mock data
        const mockCourse = MOCK_COURSE_MAP[id];
        if (mockCourse) {
          setCourse(mockCourse);
          if (mockCourse.lessons?.length > 0) {
            setCurrentLesson(mockCourse.lessons[0]);
          }
        }
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
