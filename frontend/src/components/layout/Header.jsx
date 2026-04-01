import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Support as SupportIcon,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import LanguageToggle from './LanguageToggle';

const navItems = [
  { id: 'home', label: '홈', path: '/', icon: <HomeIcon /> },
  {
    id: 'programs', label: '프로그램 신청', path: '/programs', icon: <AssignmentIcon />,
    children: [
      { label: '모집 공고', path: '/programs' },
      { label: '신청 안내', path: '/programs/guide' },
    ],
  },
  {
    id: 'activities', label: '나의 활동', path: '/activities', icon: <PersonIcon />,
    children: [
      { label: '신청 내역', path: '/activities/applications' },
      { label: '상담 기록', path: '/activities/consultations' },
      { label: '수강 현황', path: '/activities/courses' },
      { label: '북마크', path: '/activities/bookmarks' },
      { label: '상담 예약', path: '/consultations/booking' },
    ],
  },
  {
    id: 'jobs', label: '채용정보', path: '/jobs', icon: <WorkIcon />,
    children: [
      { label: '채용 공고', path: '/jobs' },
      { label: '맞춤 추천', path: '/jobs/recommendations' },
      { label: '관심 채용', path: '/jobs/favorites' },
      { label: '이력서 관리', path: '/jobs/resume' },
    ],
  },
  {
    id: 'learning', label: '학습자료', path: '/learning', icon: <SchoolIcon />,
    children: [
      { label: '온라인 강의', path: '/learning' },
      { label: '자료 다운로드', path: '/learning/downloads' },
    ],
  },
  {
    id: 'support', label: '고객지원', path: '/support', icon: <SupportIcon />,
    children: [
      { label: '공지사항', path: '/support/notices' },
      { label: 'FAQ', path: '/support/faq' },
      { label: '1:1 문의', path: '/support/inquiry' },
    ],
  },
];

const Header = ({ onMenuToggle }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin, isHRManager, isConsultant } = useAuth();
  const { getSiteTitle } = require('../../utils/siteConfig');
  const isEn = i18n.language === 'en';
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [hoveredNav, setHoveredNav] = useState(null);
  const [notifCount, setNotifCount] = useState(() => {
    const read = localStorage.getItem('woori_notif_read');
    return read ? 0 : 3;
  });

  // Load custom logo
  const [customLogo, setCustomLogo] = useState(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('woori_site_logo');
      if (saved) setCustomLogo(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const isActive = (item) => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
    setHoveredNav(null);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#FFFFFF',
          color: '#333',
          boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        {/* Top bar */}
        <Toolbar sx={{
          maxWidth: 1280,
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          minHeight: { xs: 56, sm: 64 },
        }}>
          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1, color: '#333' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0, gap: 1.5 }}
            onClick={() => navigate('/')}
          >
            {/* Logo image - custom from admin or default SVG */}
            {customLogo?.imageUrl ? (
              <Box
                component="img"
                src={customLogo.imageUrl}
                alt="Logo"
                sx={{ height: { xs: 30, sm: 34 }, objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <Box sx={{
                width: { xs: 30, sm: 34 }, height: { xs: 30, sm: 34 },
                borderRadius: '8px', bgcolor: '#0047BA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '0.85rem', sm: '1rem' }, lineHeight: 1 }}>
                  W
                </Typography>
              </Box>
            )}
            <Typography
              sx={{
                color: '#0047BA', fontWeight: 800,
                fontSize: { xs: '0.9rem', sm: '1.05rem' },
                letterSpacing: '-0.3px', whiteSpace: 'nowrap',
              }}
            >
              {getSiteTitle(isEn ? 'en' : 'ko', isMobile)}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mx: 3 }}>
              {navItems.map((item) => (
                <Box
                  key={item.id}
                  onMouseEnter={() => item.children && setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  sx={{ position: 'relative' }}
                >
                  <Button
                    onClick={() => handleNav(item.path)}
                    sx={{
                      color: isActive(item) ? '#0047BA' : '#333',
                      fontWeight: isActive(item) ? 700 : 500,
                      fontSize: '0.9rem',
                      px: 1.5, py: 1,
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      '&::after': isActive(item) ? {
                        content: '""', position: 'absolute', bottom: 0,
                        left: '20%', right: '20%', height: 2,
                        bgcolor: '#0047BA', borderRadius: 1,
                      } : {},
                      '&:hover': { backgroundColor: '#F5F7FA', color: '#0047BA' },
                    }}
                  >
                    {item.label}
                  </Button>

                  {/* Dropdown */}
                  {item.children && hoveredNav === item.id && (
                    <Box
                      sx={{
                        position: 'absolute', top: '100%', left: 0,
                        bgcolor: '#fff', borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        border: '1px solid #F0F0F0',
                        minWidth: 180, py: 1, zIndex: 1200,
                      }}
                    >
                      {item.children.map((child) => (
                        <Box
                          key={child.path}
                          onClick={() => handleNav(child.path)}
                          sx={{
                            px: 2, py: 1.2, cursor: 'pointer',
                            fontSize: '0.85rem', color: location.pathname === child.path ? '#0047BA' : '#555',
                            fontWeight: location.pathname === child.path ? 600 : 400,
                            '&:hover': { bgcolor: '#F5F7FA', color: '#0047BA' },
                          }}
                        >
                          {child.label}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            <LanguageToggle />

            <IconButton onClick={(e) => { setNotificationAnchor(e.currentTarget); setNotifCount(0); localStorage.setItem('woori_notif_read', '1'); }} sx={{ color: '#555' }}>
              <Badge badgeContent={notifCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 16, height: 16 } }}>
                <NotificationsIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>

            <IconButton onClick={(e) => { setNotificationAnchor(null); setAnchorEl(e.currentTarget); }} sx={{ ml: 0.5 }}>
              <Avatar
                sx={{ width: 34, height: 34, bgcolor: '#0047BA', fontSize: '0.8rem' }}
                src={user?.profile_image}
              >
                {user?.name_ko?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>

            {/* Admin/Instructor dashboard shortcut */}
            {!isMobile && (isAdmin() || isHRManager() || isConsultant()) && (
              <Button
                size="small"
                startIcon={<AdminIcon sx={{ fontSize: 18 }} />}
                onClick={() => navigate('/admin')}
                sx={{
                  ml: 1, fontSize: '0.8rem', color: '#666',
                  border: '1px solid #E5E5E5', borderRadius: '8px', px: 1.5,
                  '&:hover': { borderColor: '#0047BA', color: '#0047BA' },
                }}
              >
                {isAdmin() ? '관리자' : '강사 대시보드'}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
        PaperProps={{ sx: { width: 320, maxHeight: 400, borderRadius: '12px', mt: 0.5 } }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #F0F0F0' }}>
          <Typography variant="subtitle1" fontWeight={700}>알림</Typography>
        </Box>
        <MenuItem onClick={() => setNotificationAnchor(null)}>
          <Box>
            <Typography variant="body2" fontWeight={500}>새로운 프로그램이 등록되었습니다</Typography>
            <Typography variant="caption" color="text.secondary">5분 전</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => setNotificationAnchor(null)}>
          <Box>
            <Typography variant="body2" fontWeight={500}>신청이 승인되었습니다</Typography>
            <Typography variant="caption" color="text.secondary">1시간 전</Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setNotificationAnchor(null); navigate('/activities'); }} sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary" fontWeight={600}>모든 알림 보기</Typography>
        </MenuItem>
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
        PaperProps={{
          sx: {
            width: 200,
            borderRadius: '12px',
            mt: 0.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
          },
        }}
        sx={{
          '& .MuiMenu-list': { py: 0 },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #F0F0F0' }}>
          <Typography variant="subtitle2" fontWeight={700}>{user?.name_ko || 'User'}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
          <PersonIcon sx={{ mr: 1.5, fontSize: 20, color: '#888' }} /> 내 프로필
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
          <SettingsIcon sx={{ mr: 1.5, fontSize: 20, color: '#888' }} /> 설정
        </MenuItem>
        {(isAdmin() || isHRManager() || isConsultant()) && isMobile && (
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin'); }}>
            <AdminIcon sx={{ mr: 1.5, fontSize: 20, color: '#888' }} /> {isAdmin() ? '관리자 패널' : '강사 대시보드'}
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1.5, fontSize: 20, color: '#888' }} /> {t('common.logout')}
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 300, borderRadius: '0 16px 16px 0' } }}
      >
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F0F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            {customLogo?.imageUrl ? (
              <Box component="img" src={customLogo.imageUrl} alt="Logo" sx={{ height: 28, objectFit: 'contain' }} />
            ) : (
              <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: '#0047BA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.8rem', lineHeight: 1 }}>W</Typography>
              </Box>
            )}
            <Typography variant="h6" fontWeight={800} color="primary" sx={{ fontSize: '1rem' }}>
              퇴직지원 플랫폼
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User info */}
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #F0F0F0' }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#0047BA', fontSize: '0.9rem' }} src={user?.profile_image}>
            {user?.name_ko?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>{user?.name_ko || 'User'}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
        </Box>

        <List sx={{ px: 1, pt: 1 }}>
          {navItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem disablePadding sx={{ mb: 0.3 }}>
                <ListItemButton
                  onClick={() => {
                    if (item.children) {
                      setExpandedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                    } else {
                      handleNav(item.path);
                    }
                  }}
                  sx={{
                    borderRadius: '10px', py: 1.2,
                    bgcolor: isActive(item) ? 'rgba(0,71,186,0.06)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(0,71,186,0.04)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isActive(item) ? '#0047BA' : '#888' }}>
                    {React.cloneElement(item.icon, { sx: { fontSize: 22 } })}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive(item) ? 700 : 500,
                      fontSize: '0.9rem',
                      color: isActive(item) ? '#0047BA' : '#333',
                    }}
                  />
                  {item.children && (expandedItems[item.id] ? <ExpandLess sx={{ color: '#aaa' }} /> : <ExpandMore sx={{ color: '#aaa' }} />)}
                </ListItemButton>
              </ListItem>

              {item.children && (
                <Collapse in={expandedItems[item.id]} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.path}
                        onClick={() => handleNav(child.path)}
                        sx={{
                          pl: 6, py: 0.8, borderRadius: '8px', mx: 1, mb: 0.2,
                          bgcolor: location.pathname === child.path ? 'rgba(0,71,186,0.06)' : 'transparent',
                        }}
                      >
                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{
                            fontSize: '0.82rem',
                            fontWeight: location.pathname === child.path ? 600 : 400,
                            color: location.pathname === child.path ? '#0047BA' : '#666',
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}

          {(isAdmin() || isHRManager() || isConsultant()) && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNav('/admin')} sx={{ borderRadius: '10px', py: 1.2 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: '#888' }}>
                    <AdminIcon sx={{ fontSize: 22 }} />
                  </ListItemIcon>
                  <ListItemText primary={isAdmin() ? '관리자 패널' : '강사 대시보드'} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Header;
