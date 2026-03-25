import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// Default banner slides (can be overridden via admin BannerManagement)
const DEFAULT_SLIDES = [
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=450&fit=crop',
    title: '우리은행 퇴직자 통합지원 프로그램',
    subtitle: '새로운 시작을 함께합니다',
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=450&fit=crop',
    title: '맞춤형 재취업 컨설팅',
    subtitle: '전문가와 함께하는 커리어 설계',
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=450&fit=crop',
    title: '온라인 교육 프로그램',
    subtitle: '언제 어디서나 학습하세요',
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
    title: '창업 지원 서비스',
    subtitle: '성공적인 창업을 위한 첫걸음',
  },
];

// Load slides from localStorage (admin-managed) or use defaults
const loadBannerSlides = () => {
  try {
    const saved = localStorage.getItem('woori_landing_slides');
    if (saved) {
      const slides = JSON.parse(saved).filter((s) => s.active);
      if (slides.length > 0) {
        return slides.map((s) => ({
          type: 'image',
          url: s.imageUrl,
          title: s.title,
          subtitle: s.subtitle,
        }));
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_SLIDES;
};

const footerMessages = [
  '우리은행 퇴직자 통합 지원 플랫폼',
  '재취업 컨설팅 | 교육 프로그램 | 창업 지원 | 건강관리',
  '새로운 시작, 우리가 함께합니다',
  '문의: support@woori.com | 1588-0000',
];

// Extracted as a standalone component so it does NOT re-render when the carousel changes
const FooterMarquee = React.memo(() => (
  <Box
    sx={{
      backgroundColor: '#002D72',
      color: 'rgba(255,255,255,0.85)',
      py: 0.75,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        display: 'inline-block',
        whiteSpace: 'nowrap',
        animation: 'marquee 30s linear infinite',
        '@keyframes marquee': {
          '0%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      }}
    >
      <Typography variant="caption" component="span" sx={{ letterSpacing: '0.02em' }}>
        {footerMessages.map((msg, i) => (
          <React.Fragment key={i}>
            {msg}
            {i < footerMessages.length - 1 && (
              <Box component="span" sx={{ mx: 3, opacity: 0.4 }}>|</Box>
            )}
          </React.Fragment>
        ))}
      </Typography>
    </Box>
  </Box>
));

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const { getSiteTitle } = require('../../utils/siteConfig');
  const isEn = i18n.language === 'en';
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  // Load banner slides from admin settings
  const bannerSlides = useMemo(() => loadBannerSlides(), []);

  // Load Google SSO visibility setting (default: hidden)
  const showGoogleSSO = useMemo(() => {
    try {
      const saved = localStorage.getItem('woori_sso_config');
      if (saved) return JSON.parse(saved).googleSSOEnabled === true;
    } catch { /* ignore */ }
    return false;
  }, []);

  // Load custom logo from localStorage
  const customLogo = useMemo(() => {
    try {
      const saved = localStorage.getItem('woori_site_logo');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  }, [bannerSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  }, [bannerSlides.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, paused]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    const result = await login(data.email, data.password);
    if (result.success) {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const role = savedUser?.role;
      navigate(role === 'admin' || role === 'consultant' ? '/admin' : '/');
    } else {
      setError(result.error || t('auth.loginError'));
      showError(result.error || t('auth.loginError'));
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  // --- Subcomponents (rendered as plain JSX via variables, NOT function components) ---
  // Using plain JSX variables prevents React from unmounting/remounting on re-render,
  // which was causing input fields to lose focus every 5 seconds.

  const header = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 1.5,
        backgroundColor: '#0047BA',
        color: '#fff',
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src={customLogo?.imageUrl || '/logo-white.png'}
          alt="Woori Bank"
          sx={{ height: { xs: 28, md: 36 } }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <Typography
          variant={isMobile ? 'body1' : 'h6'}
          sx={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}
        >
          {getSiteTitle(isEn ? 'en' : 'ko')}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        size="small"
        component={Link}
        to="/register"
        sx={{
          color: '#fff',
          borderColor: 'rgba(255,255,255,0.5)',
          fontSize: { xs: '0.75rem', md: '0.8125rem' },
          px: { xs: 1.5, md: 2 },
          '&:hover': {
            borderColor: '#fff',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#fff',
          },
        }}
      >
        {t('auth.register')}
      </Button>
    </Box>
  );

  const bannerCarousel = (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: isMobile ? 180 : 300,
        overflow: 'hidden',
        borderRadius: isMobile ? 0 : 1,
        flexGrow: isMobile ? 0 : 1,
      }}
    >
      {bannerSlides.map((slide, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url(${slide.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: { xs: 2, md: 3 },
          }}
        >
          <Typography
            variant={isMobile ? 'body1' : 'h5'}
            sx={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            {slide.title}
          </Typography>
          <Typography
            variant={isMobile ? 'body2' : 'body1'}
            sx={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            {slide.subtitle}
          </Typography>
        </Box>
      ))}

      {/* Navigation arrows */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#fff',
          backgroundColor: 'rgba(0,0,0,0.3)',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
          width: { xs: 32, md: 40 },
          height: { xs: 32, md: 40 },
        }}
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        onClick={nextSlide}
        sx={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#fff',
          backgroundColor: 'rgba(0,0,0,0.3)',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
          width: { xs: 32, md: 40 },
          height: { xs: 32, md: 40 },
        }}
      >
        <ChevronRight />
      </IconButton>

      {/* Dots indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 8, md: 12 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 0.75,
        }}
      >
        {bannerSlides.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentSlide(index)}
            sx={{
              width: index === currentSlide ? 20 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: index === currentSlide ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );

  const loginForm = (
    <Box
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      sx={{
        width: isMobile ? '100%' : 380,
        flexShrink: 0,
        backgroundColor: '#fff',
        borderRadius: isMobile ? 0 : 1,
        border: isMobile ? 'none' : '1px solid #E5E5E5',
        p: { xs: 2.5, md: 3 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant={isMobile ? 'body1' : 'h6'}
        sx={{ color: '#0047BA', fontWeight: 700, mb: 0.5, textAlign: 'center' }}
      >
        {t('auth.login')}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: 'center', mb: 2 }}
      >
        계정에 로그인하세요
      </Typography>

      {/* Demo Account Info */}
      <Alert severity="info" sx={{ mb: 2, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
        <Typography variant="caption" fontWeight={600} sx={{ mb: 0.25, display: 'block' }}>
          데모 계정 (비밀번호: demo1234)
        </Typography>
        <Typography variant="caption">
          관리자: <strong>admin@woori.com</strong><br />
          Instructor: <strong>instructor1@woori.com</strong> / <strong>instructor2@woori.com</strong><br />
          사용자: <strong>user1@woori.com</strong> / <strong>user2@woori.com</strong> / <strong>user3@woori.com</strong>
        </Typography>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.75rem' }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label={t('auth.email')}
          type="email"
          size="small"
          {...register('email', {
            required: '이메일을 입력해주세요',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: '올바른 이메일 형식이 아닙니다',
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" sx={{ fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        <TextField
          fullWidth
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          size="small"
          {...register('password', {
            required: '비밀번호를 입력해주세요',
            minLength: {
              value: 8,
              message: '비밀번호는 최소 8자 이상이어야 합니다',
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" sx={{ fontSize: 18 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />

        <Box sx={{ textAlign: 'right', mb: 1.5 }}>
          <Typography
            component="span"
            onClick={() => window.alert('비밀번호 재설정은 관리자에게 문의해주세요.\n연락처: 070-737-8600\nEmail: support@woori.com')}
            sx={{ color: '#0047BA', fontSize: '0.75rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('auth.forgotPassword')}
          </Typography>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ mb: 1.5, py: 1 }}
        >
          {loading ? '로그인 중...' : t('auth.login')}
        </Button>
      </Box>

      {showGoogleSSO && (
        <>
          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              또는
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={handleGoogleLogin}
            startIcon={
              <Box
                component="img"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                sx={{ width: 16, height: 16 }}
              />
            }
            sx={{
              color: '#333',
              borderColor: '#E5E5E5',
              fontSize: '0.8125rem',
              '&:hover': { borderColor: '#D1D5DB', backgroundColor: '#F9FAFB', color: '#333' },
            }}
          >
            {t('auth.loginWithGoogle')}
          </Button>
        </>
      )}

      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          {t('auth.noAccount')}{' '}
          <Link to="/register" style={{ color: '#0047BA', fontWeight: 500, textDecoration: 'none' }}>
            {t('auth.register')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );

  // --- Layout ---

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#F8F9FA',
      }}
    >
      {header}

      {/* Main content area */}
      {isMobile ? (
        /* --- MOBILE LAYOUT --- */
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            minHeight: 0,
          }}
        >
          {bannerCarousel}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {loginForm}
          </Box>
        </Box>
      ) : (
        /* --- DESKTOP LAYOUT --- */
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            gap: 3,
            p: 3,
            minHeight: 0,
            alignItems: 'stretch',
          }}
        >
          {bannerCarousel}
          {loginForm}
        </Box>
      )}

      <FooterMarquee />
    </Box>
  );
};

export default LandingPage;
