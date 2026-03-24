import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Switch, FormControlLabel, Alert,
} from '@mui/material';
import {
  Lock as LockIcon,
  Notifications as NotifIcon,
  Language as LangIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const SETTINGS_KEY = 'woori_user_settings';

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {
    emailNotifications: true,
    programAlerts: true,
    consultationReminders: true,
    jobAlerts: true,
    language: 'ko',
  };
};

const UserSettings = () => {
  const { showSuccess } = useNotification();

  const [settings, setSettings] = useState(loadSettings);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleToggle = (key) => (e) => {
    const updated = { ...settings, [key]: e.target.checked };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    showSuccess('설정이 저장되었습니다.');
  };

  const handlePasswordChange = () => {
    setPwError('');
    setPwSuccess(false);

    if (!pwForm.current || !pwForm.new || !pwForm.confirm) {
      setPwError('모든 필드를 입력해주세요.');
      return;
    }
    if (pwForm.new.length < 8) {
      setPwError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (pwForm.new !== pwForm.confirm) {
      setPwError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // Mock password change
    setPwSuccess(true);
    setPwForm({ current: '', new: '', confirm: '' });
    showSuccess('비밀번호가 변경되었습니다.');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>설정</Typography>
        <Typography variant="body2" color="text.secondary">알림, 보안 등 개인 설정을 관리합니다.</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Notification Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <NotifIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>알림 설정</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Switch checked={settings.emailNotifications} onChange={handleToggle('emailNotifications')} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>이메일 알림</Typography>
                    <Typography variant="caption" color="text.secondary">중요 알림을 이메일로 받습니다</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={<Switch checked={settings.programAlerts} onChange={handleToggle('programAlerts')} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>프로그램 알림</Typography>
                    <Typography variant="caption" color="text.secondary">새 프로그램 등록 및 모집 마감 알림</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={<Switch checked={settings.consultationReminders} onChange={handleToggle('consultationReminders')} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>상담 리마인더</Typography>
                    <Typography variant="caption" color="text.secondary">예약된 상담 1일 전 알림</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={<Switch checked={settings.jobAlerts} onChange={handleToggle('jobAlerts')} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>채용 알림</Typography>
                    <Typography variant="caption" color="text.secondary">맞춤 채용 정보 알림</Typography>
                  </Box>
                }
              />
            </Box>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <LockIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>비밀번호 변경</Typography>
            </Box>

            {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
            {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>비밀번호가 변경되었습니다.</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="현재 비밀번호" type="password" value={pwForm.current}
                  onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="새 비밀번호" type="password" value={pwForm.new}
                  onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
                  helperText="8자 이상" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="새 비밀번호 확인" type="password" value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
              <Button variant="contained" onClick={handlePasswordChange}>
                비밀번호 변경
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <LangIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>언어 설정</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { code: 'ko', label: '한국어' },
                { code: 'en', label: 'English' },
              ].map((lang) => (
                <Button
                  key={lang.code}
                  variant={settings.language === lang.code ? 'contained' : 'outlined'}
                  onClick={() => {
                    const updated = { ...settings, language: lang.code };
                    setSettings(updated);
                    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
                    localStorage.setItem('language', lang.code);
                    showSuccess(`언어가 ${lang.label}(으)로 변경되었습니다.`);
                  }}
                  sx={{ minWidth: 100 }}
                >
                  {lang.label}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UserSettings;
