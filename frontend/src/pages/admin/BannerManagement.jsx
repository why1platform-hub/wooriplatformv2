import React, { useState, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, IconButton, Divider,
  Chip, Tabs, Tab, Card, CardContent, CardActions,
} from '@mui/material';
import {
  Image as ImageIcon, Close as CloseIcon, Save as SaveIcon,
  Visibility as PreviewIcon, Campaign as BannerIcon, TextFields as TextIcon,
  Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon,
  ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon,
  BrandingWatermark as LogoIcon, Slideshow as SlideshowIcon,
  Home as HomeIcon,
  ChevronLeft, ChevronRight,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const createDefaultPopup = (id) => ({
  id,
  active: true,
  title: '',
  content: '',
  imageUrl: '',
  linkUrl: '',
  linkText: '',
});

const createDefaultSlide = (id) => ({
  id,
  active: true,
  title: '',
  subtitle: '',
  imageUrl: '',
});

const DEFAULT_POPUPS = [
  {
    id: 1,
    active: true,
    title: '2026년 상반기 시니어 프로그램 모집',
    content: '금융컨설팅, 부동산, 창업 등 다양한 프로그램에 참여하세요!',
    imageUrl: '',
    linkUrl: '/programs',
    linkText: '자세히 보기',
  },
];

const DEFAULT_FOOTER_BANNERS = [
  { id: 1, text: '📢 2026년 상반기 시니어 프로그램 모집 중! 지금 바로 신청하세요.', active: true },
  { id: 2, text: '💼 신규 채용정보가 등록되었습니다. 채용공고를 확인해보세요!', active: true },
  { id: 3, text: '📚 새로운 온라인 강좌 "AI 활용 실무"가 오픈되었습니다.', active: true },
];

const DEFAULT_SLIDES = [
  { id: 1, active: true, title: '우리은행 퇴직자 지원 프로그램', subtitle: '새로운 시작을 함께합니다', imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=450&fit=crop' },
  { id: 2, active: true, title: '맞춤형 재취업 컨설팅', subtitle: '전문가와 함께하는 커리어 설계', imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=450&fit=crop' },
  { id: 3, active: true, title: '온라인 교육 프로그램', subtitle: '언제 어디서나 학습하세요', imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=450&fit=crop' },
  { id: 4, active: true, title: '창업 지원 서비스', subtitle: '성공적인 창업을 위한 첫걸음', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop' },
];

const createDefaultHomeBanner = (id) => ({
  id,
  active: true,
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  linkText: '자세히 보기',
});

const DEFAULT_HOME_BANNERS = [
  {
    id: 1, active: true,
    title: '2026년도 연간 교육 일정 안내',
    subtitle: '퇴직자 종사자를 위한',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=500&fit=crop',
    linkUrl: '/programs',
    linkText: '자세히 보기',
  },
  {
    id: 2, active: true,
    title: '맞춤형 재취업 컨설팅 오픈',
    subtitle: '전문가와 함께하는 커리어 설계',
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=500&fit=crop',
    linkUrl: '/consultations/booking',
    linkText: '자세히 보기',
  },
  {
    id: 3, active: true,
    title: '새로운 온라인 강좌 오픈',
    subtitle: '언제 어디서나 학습하세요',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=500&fit=crop',
    linkUrl: '/learning',
    linkText: '자세히 보기',
  },
];

const BannerManagement = () => {
  const { showSuccess } = useNotification();
  const [tab, setTab] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState('popup');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingSlideIndex, setEditingSlideIndex] = useState(null);
  const imageInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const slideImageInputRef = useRef(null);
  const homeBannerImageInputRef = useRef(null);

  // Load saved popup banners
  const [popups, setPopups] = useState(() => {
    try {
      const saved = localStorage.getItem('woori_popup_banners');
      if (saved) return JSON.parse(saved);
      const oldSaved = localStorage.getItem('woori_popup_banner');
      if (oldSaved) {
        const old = JSON.parse(oldSaved);
        return [{ ...old, id: 1 }];
      }
      return DEFAULT_POPUPS;
    } catch { return DEFAULT_POPUPS; }
  });

  const [footerBanners, setFooterBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('woori_footer_banners');
      return saved ? JSON.parse(saved) : DEFAULT_FOOTER_BANNERS;
    } catch { return DEFAULT_FOOTER_BANNERS; }
  });

  const [footerSpeed, setFooterSpeed] = useState(() => {
    return parseInt(localStorage.getItem('woori_footer_speed') || '30', 10);
  });

  const [footerActive, setFooterActive] = useState(() => {
    return localStorage.getItem('woori_footer_active') !== 'false';
  });

  // Load site logo
  const [siteLogo, setSiteLogo] = useState(() => {
    try {
      const saved = localStorage.getItem('woori_site_logo');
      return saved ? JSON.parse(saved) : { imageUrl: '' };
    } catch { return { imageUrl: '' }; }
  });

  // Load landing page slides
  const [slides, setSlides] = useState(() => {
    try {
      const saved = localStorage.getItem('woori_landing_slides');
      return saved ? JSON.parse(saved) : DEFAULT_SLIDES;
    } catch { return DEFAULT_SLIDES; }
  });

  // Load home page banners
  const [homeBanners, setHomeBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('woori_home_banners');
      return saved ? JSON.parse(saved) : DEFAULT_HOME_BANNERS;
    } catch { return DEFAULT_HOME_BANNERS; }
  });
  const [editingHomeBannerIndex, setEditingHomeBannerIndex] = useState(null);
  const [homeBannerPreviewIndex, setHomeBannerPreviewIndex] = useState(0);

  // ─── Save handlers ─────────────────────────────────
  const handleSavePopups = () => {
    localStorage.setItem('woori_popup_banners', JSON.stringify(popups));
    localStorage.removeItem('woori_popup_banner');
    showSuccess('팝업 배너가 저장되었습니다');
  };

  const handleSaveFooter = () => {
    localStorage.setItem('woori_footer_banners', JSON.stringify(footerBanners));
    localStorage.setItem('woori_footer_speed', String(footerSpeed));
    localStorage.setItem('woori_footer_active', String(footerActive));
    showSuccess('하단 배너가 저장되었습니다');
  };

  const handleSaveLogo = () => {
    localStorage.setItem('woori_site_logo', JSON.stringify(siteLogo));
    showSuccess('로고가 저장되었습니다. 새로고침 후 반영됩니다.');
  };

  const handleSaveSlides = () => {
    localStorage.setItem('woori_landing_slides', JSON.stringify(slides));
    showSuccess('랜딩 배너가 저장되었습니다. 새로고침 후 반영됩니다.');
  };

  const handleSaveHomeBanners = () => {
    localStorage.setItem('woori_home_banners', JSON.stringify(homeBanners));
    showSuccess('홈 배너가 저장되었습니다. 새로고침 후 반영됩니다.');
  };

  // ─── Popup handlers ─────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || editingIndex === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updatePopup(editingIndex, 'imageUrl', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const addPopup = () => {
    const newId = Math.max(0, ...popups.map((p) => p.id)) + 1;
    setPopups((prev) => [...prev, createDefaultPopup(newId)]);
    setEditingIndex(popups.length);
  };

  const removePopup = (index) => {
    setPopups((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);
  };

  const updatePopup = (index, field, value) => {
    setPopups((prev) => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  // ─── Footer handlers ─────────────────────────────────
  const addFooterBanner = () => {
    const newId = Math.max(0, ...footerBanners.map((b) => b.id)) + 1;
    setFooterBanners((prev) => [...prev, { id: newId, text: '', active: true }]);
  };

  const removeFooterBanner = (id) => {
    setFooterBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const updateFooterBanner = (id, field, value) => {
    setFooterBanners((prev) => prev.map((b) => b.id === id ? { ...b, [field]: value } : b));
  };

  // ─── Logo handler ─────────────────────────────────
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSiteLogo({ imageUrl: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  // ─── Slide handlers ─────────────────────────────────
  const addSlide = () => {
    const newId = Math.max(0, ...slides.map((s) => s.id)) + 1;
    setSlides((prev) => [...prev, createDefaultSlide(newId)]);
    setEditingSlideIndex(slides.length);
  };

  const removeSlide = (index) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
    if (editingSlideIndex === index) setEditingSlideIndex(null);
    else if (editingSlideIndex !== null && editingSlideIndex > index) setEditingSlideIndex(editingSlideIndex - 1);
  };

  const updateSlide = (index, field, value) => {
    setSlides((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSlideImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || editingSlideIndex === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateSlide(editingSlideIndex, 'imageUrl', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  // ─── Home Banner handlers ─────────────────────────────────
  const addHomeBanner = () => {
    const newId = Math.max(0, ...homeBanners.map((b) => b.id)) + 1;
    setHomeBanners((prev) => [...prev, createDefaultHomeBanner(newId)]);
    setEditingHomeBannerIndex(homeBanners.length);
  };

  const removeHomeBanner = (index) => {
    setHomeBanners((prev) => prev.filter((_, i) => i !== index));
    if (editingHomeBannerIndex === index) setEditingHomeBannerIndex(null);
    else if (editingHomeBannerIndex !== null && editingHomeBannerIndex > index) setEditingHomeBannerIndex(editingHomeBannerIndex - 1);
  };

  const updateHomeBanner = (index, field, value) => {
    setHomeBanners((prev) => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const handleHomeBannerImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || editingHomeBannerIndex === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateHomeBanner(editingHomeBannerIndex, 'imageUrl', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const activePreviewPopups = popups.filter((p) => p.active);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>배너 관리</Typography>
        <Typography variant="body2" color="text.secondary">
          홈 배너, 팝업 배너, 하단 롤링 배너, 랜딩 배너, 사이트 로고를 관리합니다
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setEditingIndex(null); setEditingSlideIndex(null); setEditingHomeBannerIndex(null); }}
        sx={{ mb: 3, '& .MuiTab-root': { fontSize: '0.875rem' } }}
        variant="scrollable" scrollButtons="auto">
        <Tab icon={<HomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="홈 배너" />
        <Tab icon={<BannerIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="팝업 배너" />
        <Tab icon={<TextIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="하단 롤링 배너" />
        <Tab icon={<SlideshowIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="랜딩 배너" />
        <Tab icon={<LogoIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="사이트 로고" />
      </Tabs>

      {/* ─── Tab 0: Home Banner Management ─────────────────────── */}
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} fontSize="0.9375rem">
              홈 페이지 롤링 배너 ({homeBanners.length}개)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<PreviewIcon />}
                onClick={() => { setPreviewType('homeBanner'); setHomeBannerPreviewIndex(0); setPreviewOpen(true); }}
                disabled={homeBanners.filter((b) => b.active).length === 0}>
                미리보기
              </Button>
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveHomeBanners}>
                저장
              </Button>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            로그인 후 홈 페이지 상단에 표시되는 롤링 배너를 관리합니다. 이미지, 제목, 부제목, 링크를 설정할 수 있습니다.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {homeBanners.map((banner, index) => (
              <Grid item xs={12} sm={6} md={4} key={banner.id}>
                <Card variant="outlined" sx={{
                  borderRadius: '12px',
                  borderColor: editingHomeBannerIndex === index ? 'primary.main' : 'divider',
                  borderWidth: editingHomeBannerIndex === index ? 2 : 1,
                  opacity: banner.active ? 1 : 0.6,
                }}>
                  {banner.imageUrl ? (
                    <Box sx={{
                      width: '100%', height: 140, position: 'relative',
                      backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%), url(${banner.imageUrl})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 1.5,
                    }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem' }}>{banner.subtitle}</Typography>
                      <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>{banner.title || '(제목 없음)'}</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: 140, bgcolor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    </Box>
                  )}
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Chip label={banner.active ? '활성' : '비활성'} size="small"
                        color={banner.active ? 'success' : 'default'} />
                      <Switch size="small" checked={banner.active}
                        onChange={(e) => updateHomeBanner(index, 'active', e.target.checked)} />
                    </Box>
                    {banner.linkUrl && (
                      <Typography variant="caption" color="text.secondary">
                        링크: {banner.linkUrl}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ pt: 0, px: 2, pb: 1.5 }}>
                    <Button size="small" startIcon={<EditIcon />}
                      onClick={() => setEditingHomeBannerIndex(editingHomeBannerIndex === index ? null : index)}>
                      편집
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" color="error" onClick={() => removeHomeBanner(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{
                borderRadius: '12px', borderStyle: 'dashed', display: 'flex',
                alignItems: 'center', justifyContent: 'center', minHeight: 220,
                cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' },
              }}
                onClick={addHomeBanner}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <AddIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">새 배너 추가</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {editingHomeBannerIndex !== null && homeBanners[editingHomeBannerIndex] && (
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'primary.main', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  배너 #{editingHomeBannerIndex + 1} 편집
                </Typography>
                <IconButton size="small" onClick={() => setEditingHomeBannerIndex(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="제목" placeholder="2026년도 연간 교육 일정 안내"
                    value={homeBanners[editingHomeBannerIndex].title}
                    onChange={(e) => updateHomeBanner(editingHomeBannerIndex, 'title', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="부제목" placeholder="퇴직자 종사자를 위한"
                    value={homeBanners[editingHomeBannerIndex].subtitle}
                    onChange={(e) => updateHomeBanner(editingHomeBannerIndex, 'subtitle', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="링크 URL" placeholder="/programs"
                    value={homeBanners[editingHomeBannerIndex].linkUrl}
                    onChange={(e) => updateHomeBanner(editingHomeBannerIndex, 'linkUrl', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="링크 버튼 텍스트" placeholder="자세히 보기"
                    value={homeBanners[editingHomeBannerIndex].linkText}
                    onChange={(e) => updateHomeBanner(editingHomeBannerIndex, 'linkText', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="이미지 URL (외부 링크)" placeholder="https://..."
                    value={homeBanners[editingHomeBannerIndex].imageUrl?.startsWith('data:') ? '' : (homeBanners[editingHomeBannerIndex].imageUrl || '')}
                    onChange={(e) => updateHomeBanner(editingHomeBannerIndex, 'imageUrl', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>또는 이미지 업로드</Typography>
                  <input type="file" accept="image/*" ref={homeBannerImageInputRef} hidden onChange={handleHomeBannerImageUpload} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => homeBannerImageInputRef.current?.click()}>
                      이미지 업로드
                    </Button>
                    {homeBanners[editingHomeBannerIndex].imageUrl && (
                      <Box sx={{ position: 'relative' }}>
                        <Box component="img" src={homeBanners[editingHomeBannerIndex].imageUrl} alt="Banner"
                          sx={{ width: 240, height: 100, objectFit: 'cover', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }} />
                        <IconButton size="small"
                          onClick={() => updateHomeBanner(editingHomeBannerIndex, 'imageUrl', '')}
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: '#fff', width: 20, height: 20,
                            '&:hover': { bgcolor: 'error.dark' } }}>
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    권장: 1200 x 500px, JPG 또는 PNG
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      )}

      {/* ─── Tab 1: Popup Banners ─────────────────────────────── */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} fontSize="0.9375rem">
              팝업 배너 목록 ({popups.length}개)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<PreviewIcon />}
                onClick={() => { setPreviewType('popup'); setPreviewIndex(0); setPreviewOpen(true); }}
                disabled={activePreviewPopups.length === 0}>
                미리보기
              </Button>
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSavePopups}>
                저장
              </Button>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {popups.map((popup, index) => (
              <Grid item xs={12} sm={6} md={4} key={popup.id}>
                <Card variant="outlined" sx={{
                  borderRadius: '12px',
                  borderColor: editingIndex === index ? 'primary.main' : 'divider',
                  borderWidth: editingIndex === index ? 2 : 1,
                  opacity: popup.active ? 1 : 0.6,
                }}>
                  {popup.imageUrl && (
                    <Box component="img" src={popup.imageUrl} alt="Banner"
                      sx={{ width: '100%', height: 100, objectFit: 'cover' }} />
                  )}
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={popup.active ? '활성' : '비활성'} size="small"
                        color={popup.active ? 'success' : 'default'} />
                      <Switch size="small" checked={popup.active}
                        onChange={(e) => updatePopup(index, 'active', e.target.checked)} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {popup.title || '(제목 없음)'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {popup.content || '(내용 없음)'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ pt: 0, px: 2, pb: 1.5 }}>
                    <Button size="small" startIcon={<EditIcon />}
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}>
                      편집
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" color="error" onClick={() => removePopup(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{
                borderRadius: '12px', borderStyle: 'dashed', display: 'flex',
                alignItems: 'center', justifyContent: 'center', minHeight: 160,
                cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' },
              }}
                onClick={addPopup}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <AddIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">새 팝업 추가</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {editingIndex !== null && popups[editingIndex] && (
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'primary.main', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  팝업 #{editingIndex + 1} 편집
                </Typography>
                <IconButton size="small" onClick={() => setEditingIndex(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="제목" value={popups[editingIndex].title}
                    onChange={(e) => updatePopup(editingIndex, 'title', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="내용" multiline rows={3} value={popups[editingIndex].content}
                    onChange={(e) => updatePopup(editingIndex, 'content', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="링크 URL" placeholder="/programs" value={popups[editingIndex].linkUrl}
                    onChange={(e) => updatePopup(editingIndex, 'linkUrl', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="링크 텍스트" value={popups[editingIndex].linkText}
                    onChange={(e) => updatePopup(editingIndex, 'linkText', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>배너 이미지 (선택)</Typography>
                  <input type="file" accept="image/*" ref={imageInputRef} hidden onChange={handleImageUpload} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => imageInputRef.current?.click()}>
                      이미지 업로드
                    </Button>
                    {popups[editingIndex].imageUrl && (
                      <Box sx={{ position: 'relative' }}>
                        <Box component="img" src={popups[editingIndex].imageUrl} alt="Banner"
                          sx={{ width: 200, height: 100, objectFit: 'cover', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }} />
                        <IconButton size="small"
                          onClick={() => updatePopup(editingIndex, 'imageUrl', '')}
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: '#fff', width: 20, height: 20,
                            '&:hover': { bgcolor: 'error.dark' } }}>
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      )}

      {/* ─── Tab 2: Footer Running Banner ──────────────────────── */}
      {tab === 2 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600} fontSize="0.9375rem">하단 롤링 배너 설정</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<PreviewIcon />}
                onClick={() => { setPreviewType('footer'); setPreviewOpen(true); }}>
                미리보기
              </Button>
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveFooter}>
                저장
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <FormControlLabel
              control={<Switch checked={footerActive} onChange={(e) => setFooterActive(e.target.checked)} />}
              label={footerActive ? '활성화' : '비활성화'}
            />
            <TextField label="스크롤 속도 (초)" type="number" size="small" value={footerSpeed}
              onChange={(e) => setFooterSpeed(Math.max(5, Math.min(120, parseInt(e.target.value) || 30)))}
              sx={{ width: 150 }}
              inputProps={{ min: 5, max: 120 }}
              helperText="5~120초"
            />
          </Box>

          {footerBanners.map((banner, index) => (
            <Box key={banner.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Chip label={index + 1} size="small" sx={{ minWidth: 28 }} />
              <Switch size="small" checked={banner.active}
                onChange={(e) => updateFooterBanner(banner.id, 'active', e.target.checked)} />
              <TextField fullWidth size="small" placeholder="배너 텍스트를 입력하세요..."
                value={banner.text}
                onChange={(e) => updateFooterBanner(banner.id, 'text', e.target.value)} />
              <IconButton size="small" color="error" onClick={() => removeFooterBanner(banner.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          <Button startIcon={<AddIcon />} size="small" onClick={addFooterBanner} sx={{ mt: 1 }}>
            배너 추가
          </Button>
        </Paper>
      )}

      {/* ─── Tab 3: Landing Page Banner Slides ─────────────────── */}
      {tab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} fontSize="0.9375rem">
              랜딩 페이지 배너 ({slides.length}개)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<PreviewIcon />}
                onClick={() => { setPreviewType('slides'); setPreviewIndex(0); setPreviewOpen(true); }}
                disabled={slides.filter((s) => s.active).length === 0}>
                미리보기
              </Button>
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSlides}>
                저장
              </Button>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {slides.map((slide, index) => (
              <Grid item xs={12} sm={6} md={4} key={slide.id}>
                <Card variant="outlined" sx={{
                  borderRadius: '12px',
                  borderColor: editingSlideIndex === index ? 'primary.main' : 'divider',
                  borderWidth: editingSlideIndex === index ? 2 : 1,
                  opacity: slide.active ? 1 : 0.6,
                }}>
                  {slide.imageUrl && (
                    <Box component="img" src={slide.imageUrl} alt="Slide"
                      sx={{ width: '100%', height: 120, objectFit: 'cover' }} />
                  )}
                  {!slide.imageUrl && (
                    <Box sx={{ width: '100%', height: 120, bgcolor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    </Box>
                  )}
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={slide.active ? '활성' : '비활성'} size="small"
                        color={slide.active ? 'success' : 'default'} />
                      <Switch size="small" checked={slide.active}
                        onChange={(e) => updateSlide(index, 'active', e.target.checked)} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {slide.title || '(제목 없음)'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {slide.subtitle || '(부제목 없음)'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ pt: 0, px: 2, pb: 1.5 }}>
                    <Button size="small" startIcon={<EditIcon />}
                      onClick={() => setEditingSlideIndex(editingSlideIndex === index ? null : index)}>
                      편집
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" color="error" onClick={() => removeSlide(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{
                borderRadius: '12px', borderStyle: 'dashed', display: 'flex',
                alignItems: 'center', justifyContent: 'center', minHeight: 200,
                cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' },
              }}
                onClick={addSlide}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <AddIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">새 슬라이드 추가</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {editingSlideIndex !== null && slides[editingSlideIndex] && (
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'primary.main', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  슬라이드 #{editingSlideIndex + 1} 편집
                </Typography>
                <IconButton size="small" onClick={() => setEditingSlideIndex(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="제목" value={slides[editingSlideIndex].title}
                    onChange={(e) => updateSlide(editingSlideIndex, 'title', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="부제목" value={slides[editingSlideIndex].subtitle}
                    onChange={(e) => updateSlide(editingSlideIndex, 'subtitle', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="이미지 URL (외부 링크)" placeholder="https://..." value={slides[editingSlideIndex].imageUrl}
                    onChange={(e) => updateSlide(editingSlideIndex, 'imageUrl', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>또는 이미지 업로드</Typography>
                  <input type="file" accept="image/*" ref={slideImageInputRef} hidden onChange={handleSlideImageUpload} />
                  <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => slideImageInputRef.current?.click()}>
                    이미지 업로드
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      )}

      {/* ─── Tab 4: Site Logo ──────────────────────────────────── */}
      {tab === 4 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600} fontSize="0.9375rem">사이트 로고 설정</Typography>
            <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveLogo}>
              저장
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            헤더 좌측 상단에 표시되는 로고 이미지를 설정합니다. 저장 후 페이지를 새로고침하면 반영됩니다.
          </Typography>

          <input type="file" accept="image/*" ref={logoInputRef} hidden onChange={handleLogoUpload} />

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            {/* Current logo preview */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', textAlign: 'center', minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>현재 로고</Typography>
              {siteLogo.imageUrl ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Box component="img" src={siteLogo.imageUrl} alt="Logo"
                    sx={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain' }} />
                  <IconButton size="small"
                    onClick={() => setSiteLogo({ imageUrl: '' })}
                    sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'error.main', color: '#fff', width: 20, height: 20,
                      '&:hover': { bgcolor: 'error.dark' } }}>
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" color="text.disabled">기본 로고 사용 중</Typography>
                </Box>
              )}
            </Paper>

            {/* Header preview */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>헤더 미리보기</Typography>
              <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', borderRadius: '8px', p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="img"
                  src={siteLogo.imageUrl || '/logo.png'}
                  alt="Logo Preview"
                  sx={{ height: 32 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <Typography variant="body1" sx={{ color: '#0047BA', fontWeight: 700 }}>
                  퇴직지원 플랫폼
                </Typography>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => logoInputRef.current?.click()}>
              로고 이미지 업로드
            </Button>
            <Typography variant="caption" color="text.secondary">
              권장: PNG 또는 SVG, 높이 32~40px, 투명 배경
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>또는 이미지 URL 붙여넣기</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="https://example.com/logo.png"
              value={siteLogo.imageUrl?.startsWith('data:') ? '' : (siteLogo.imageUrl || '')}
              onChange={(e) => setSiteLogo({ imageUrl: e.target.value })}
              helperText="외부 이미지 URL을 직접 입력하세요"
            />
          </Box>
        </Paper>
      )}

      {/* ─── Preview Dialog ───────────────────────────────────────── */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700} fontSize="1rem">
            {previewType === 'homeBanner' ? '홈 배너 미리보기' : previewType === 'popup' ? '팝업 배너 미리보기' : previewType === 'slides' ? '랜딩 배너 미리보기' : '하단 배너 미리보기'}
          </Typography>
          <IconButton size="small" onClick={() => setPreviewOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewType === 'homeBanner' && (() => {
            const activeBanners = homeBanners.filter((b) => b.active);
            const banner = activeBanners[homeBannerPreviewIndex];
            if (!banner) return null;
            return (
              <Box sx={{ py: 2 }}>
                {activeBanners.length > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                    <IconButton size="small" disabled={homeBannerPreviewIndex === 0}
                      onClick={() => setHomeBannerPreviewIndex((i) => i - 1)}>
                      <ChevronLeft fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" fontWeight={600}>
                      {homeBannerPreviewIndex + 1} / {activeBanners.length}
                    </Typography>
                    <IconButton size="small" disabled={homeBannerPreviewIndex >= activeBanners.length - 1}
                      onClick={() => setHomeBannerPreviewIndex((i) => i + 1)}>
                      <ChevronRight fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Box sx={{
                  position: 'relative', borderRadius: '16px', overflow: 'hidden', height: 220,
                  backgroundImage: banner.imageUrl
                    ? `linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%), url(${banner.imageUrl})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 3,
                }}>
                  {banner.subtitle && (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 0.5 }}>{banner.subtitle}</Typography>
                  )}
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 1.5 }}>{banner.title || '(제목 없음)'}</Typography>
                  {banner.linkText && (
                    <Button variant="outlined" size="small" sx={{
                      color: '#fff', borderColor: 'rgba(255,255,255,0.7)', borderRadius: '20px',
                      width: 'fit-content', fontSize: '0.8rem',
                    }}>
                      {banner.linkText}
                    </Button>
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  활성 배너: {activeBanners.length}개 · 자동 전환: 5초
                </Typography>
              </Box>
            );
          })()}
          {previewType === 'popup' && activePreviewPopups.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {activePreviewPopups.length > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                  <IconButton size="small" disabled={previewIndex === 0}
                    onClick={() => setPreviewIndex((i) => i - 1)}>
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" fontWeight={600}>
                    {previewIndex + 1} / {activePreviewPopups.length}
                  </Typography>
                  <IconButton size="small" disabled={previewIndex >= activePreviewPopups.length - 1}
                    onClick={() => setPreviewIndex((i) => i + 1)}>
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              {(() => {
                const popup = activePreviewPopups[previewIndex];
                if (!popup) return null;
                return (
                  <>
                    {popup.imageUrl && (
                      <Box component="img" src={popup.imageUrl} alt="Preview"
                        sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '8px', mb: 2 }} />
                    )}
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{popup.title || '(제목 없음)'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{popup.content || '(내용 없음)'}</Typography>
                    {popup.linkText && <Button variant="contained" size="small">{popup.linkText}</Button>}
                  </>
                );
              })()}
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                활성화된 팝업: {activePreviewPopups.length}개
              </Typography>
            </Box>
          )}
          {previewType === 'slides' && (() => {
            const activeSlides = slides.filter((s) => s.active);
            const slide = activeSlides[previewIndex];
            if (!slide) return null;
            return (
              <Box sx={{ py: 2 }}>
                {activeSlides.length > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                    <IconButton size="small" disabled={previewIndex === 0}
                      onClick={() => setPreviewIndex((i) => i - 1)}>
                      <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" fontWeight={600}>
                      {previewIndex + 1} / {activeSlides.length}
                    </Typography>
                    <IconButton size="small" disabled={previewIndex >= activeSlides.length - 1}
                      onClick={() => setPreviewIndex((i) => i + 1)}>
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Box sx={{
                  position: 'relative', borderRadius: '8px', overflow: 'hidden', height: 200,
                  backgroundImage: slide.imageUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url(${slide.imageUrl})` : undefined,
                  bgcolor: slide.imageUrl ? undefined : '#E5E7EB',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 2,
                }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{slide.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{slide.subtitle}</Typography>
                </Box>
              </Box>
            );
          })()}
          {previewType === 'footer' && (
            <Box sx={{ py: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>미리보기 (스크롤 속도: {footerSpeed}초)</Typography>
              <Box sx={{
                bgcolor: '#0047BA', color: '#fff', p: 1.5, borderRadius: '8px',
                overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative',
              }}>
                <Box sx={{
                  display: 'inline-block', animation: `marquee ${footerSpeed}s linear infinite`,
                  '@keyframes marquee': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                  },
                }}>
                  {footerBanners.filter((b) => b.active && b.text).map((b) => b.text).join('     |     ') || '(활성화된 배너가 없습니다)'}
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                상태: {footerActive ? '활성화' : '비활성화'} · 활성 배너: {footerBanners.filter((b) => b.active).length}개
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BannerManagement;
