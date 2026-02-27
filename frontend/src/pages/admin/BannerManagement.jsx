import React, { useState, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, IconButton, Divider,
  Chip, Tabs, Tab,
} from '@mui/material';
import {
  Image as ImageIcon, Close as CloseIcon, Save as SaveIcon,
  Visibility as PreviewIcon, Campaign as BannerIcon, TextFields as TextIcon,
  Delete as DeleteIcon, Add as AddIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const DEFAULT_POPUP = {
  active: true,
  title: '2026년 상반기 시니어 프로그램 모집',
  content: '금융컨설팅, 부동산, 창업 등 다양한 프로그램에 참여하세요!',
  imageUrl: '',
  linkUrl: '/programs',
  linkText: '자세히 보기',
};

const DEFAULT_FOOTER_BANNERS = [
  { id: 1, text: '📢 2026년 상반기 시니어 프로그램 모집 중! 지금 바로 신청하세요.', active: true },
  { id: 2, text: '💼 신규 채용정보가 등록되었습니다. 채용공고를 확인해보세요!', active: true },
  { id: 3, text: '📚 새로운 온라인 강좌 "AI 활용 실무"가 오픈되었습니다.', active: true },
];

const BannerManagement = () => {
  const { showSuccess } = useNotification();
  const [tab, setTab] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState('popup');
  const imageInputRef = useRef(null);

  // Load saved banner data or use defaults
  const [popup, setPopup] = useState(() => {
    try {
      const saved = localStorage.getItem('woori_popup_banner');
      return saved ? JSON.parse(saved) : DEFAULT_POPUP;
    } catch { return DEFAULT_POPUP; }
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

  const handleSavePopup = () => {
    localStorage.setItem('woori_popup_banner', JSON.stringify(popup));
    showSuccess('팝업 배너가 저장되었습니다');
  };

  const handleSaveFooter = () => {
    localStorage.setItem('woori_footer_banners', JSON.stringify(footerBanners));
    localStorage.setItem('woori_footer_speed', String(footerSpeed));
    localStorage.setItem('woori_footer_active', String(footerActive));
    showSuccess('하단 배너가 저장되었습니다');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPopup((p) => ({ ...p, imageUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

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

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>배너 관리</Typography>
        <Typography variant="body2" color="text.secondary">
          팝업 배너와 하단 롤링 배너를 관리합니다
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { fontSize: '0.875rem' } }}>
        <Tab icon={<BannerIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="팝업 배너" />
        <Tab icon={<TextIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="하단 롤링 배너" />
      </Tabs>

      {/* ─── Popup Banner ───────────────────────────────────────── */}
      {tab === 0 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600} fontSize="0.9375rem">팝업 배너 설정</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<PreviewIcon />}
                onClick={() => { setPreviewType('popup'); setPreviewOpen(true); }}>
                미리보기
              </Button>
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSavePopup}>
                저장
              </Button>
            </Box>
          </Box>

          <FormControlLabel
            control={<Switch checked={popup.active} onChange={(e) => setPopup((p) => ({ ...p, active: e.target.checked }))} />}
            label={popup.active ? '활성화' : '비활성화'}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="제목" value={popup.title}
                onChange={(e) => setPopup((p) => ({ ...p, title: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="내용" multiline rows={3} value={popup.content}
                onChange={(e) => setPopup((p) => ({ ...p, content: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="링크 URL" placeholder="/programs" value={popup.linkUrl}
                onChange={(e) => setPopup((p) => ({ ...p, linkUrl: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="링크 텍스트" value={popup.linkText}
                onChange={(e) => setPopup((p) => ({ ...p, linkText: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>배너 이미지 (선택)</Typography>
              <input type="file" accept="image/*" ref={imageInputRef} hidden onChange={handleImageUpload} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => imageInputRef.current?.click()}>
                  이미지 업로드
                </Button>
                {popup.imageUrl && (
                  <Box sx={{ position: 'relative' }}>
                    <Box component="img" src={popup.imageUrl} alt="Banner"
                      sx={{ width: 200, height: 100, objectFit: 'cover', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }} />
                    <IconButton size="small"
                      onClick={() => setPopup((p) => ({ ...p, imageUrl: '' }))}
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

      {/* ─── Footer Running Banner ──────────────────────────────── */}
      {tab === 1 && (
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

      {/* ─── Preview Dialog ───────────────────────────────────────── */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700} fontSize="1rem">
            {previewType === 'popup' ? '팝업 배너 미리보기' : '하단 배너 미리보기'}
          </Typography>
          <IconButton size="small" onClick={() => setPreviewOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewType === 'popup' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {popup.imageUrl && (
                <Box component="img" src={popup.imageUrl} alt="Preview"
                  sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '8px', mb: 2 }} />
              )}
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{popup.title || '(제목 없음)'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{popup.content || '(내용 없음)'}</Typography>
              {popup.linkText && (
                <Button variant="contained" size="small">{popup.linkText}</Button>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                상태: {popup.active ? '✅ 활성화' : '❌ 비활성화'}
              </Typography>
            </Box>
          )}
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
                상태: {footerActive ? '✅ 활성화' : '❌ 비활성화'} · 활성 배너: {footerBanners.filter((b) => b.active).length}개
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BannerManagement;
