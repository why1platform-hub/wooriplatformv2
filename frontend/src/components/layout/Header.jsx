import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import LanguageToggle from './LanguageToggle';

const Header = ({ onMenuToggle, sidebarOpen }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileClose();
    await logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleProfileClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleProfileClose();
    navigate('/settings');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#333333',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {/* Menu toggle for mobile */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Woori Bank"
            sx={{
              height: 32,
              mr: 1,
              display: { xs: 'none', sm: 'block' },
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: '#0047BA',
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.125rem' },
            }}
          >
            {isMobile ? '퇴직지원 플랫폼' : t('common.appName')}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Language Toggle */}
          <LanguageToggle />

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
            aria-label="notifications"
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 },
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #E5E5E5' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                알림
              </Typography>
            </Box>
            <MenuItem onClick={handleNotificationClose}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  새로운 프로그램이 등록되었습니다
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  5분 전
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  신청이 승인되었습니다
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1시간 전
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleNotificationClose();
                navigate('/notifications');
              }}
              sx={{ justifyContent: 'center' }}
            >
              <Typography variant="body2" color="primary">
                모든 알림 보기
              </Typography>
            </MenuItem>
          </Menu>

          {/* Profile */}
          <IconButton
            onClick={handleProfileClick}
            sx={{ ml: 1 }}
            aria-label="profile"
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#0047BA',
                fontSize: '0.875rem',
              }}
              src={user?.profile_image}
            >
              {user?.name_ko?.charAt(0) || user?.name_en?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            PaperProps={{
              sx: { width: 200 },
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #E5E5E5' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.name_ko || user?.name_en || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <MenuItem onClick={handleProfile}>
              <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
              내 프로필
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
              설정
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              {t('common.logout')}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
