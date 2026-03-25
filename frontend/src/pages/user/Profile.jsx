import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Avatar,
  Divider, Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Profile = () => {
  const { user } = useAuth();
  const { showSuccess } = useNotification();

  const [form, setForm] = useState({
    name_ko: user?.name_ko || '',
    name_en: user?.name_en || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
    retirement_date: user?.retirement_date || '',
    bio: user?.bio || '',
    skills: (user?.skills || []).join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    // Save to localStorage (mock mode)
    const updatedUser = {
      ...user,
      ...form,
      skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setSaving(false);
    setSaved(true);
    showSuccess('프로필이 저장되었습니다.');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>내 프로필</Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.name_ko || user?.name_en || '회원'}님, 환영합니다! 개인정보를 확인하고 수정할 수 있습니다.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar sx={{ width: 96, height: 96, bgcolor: '#0047BA', fontSize: '2rem', mx: 'auto' }}
                  src={user?.profile_image}>
                  {(user?.name_ko || user?.name_en || 'U').charAt(0)}
                </Avatar>
                <Box sx={{
                  position: 'absolute', bottom: 0, right: -4,
                  width: 32, height: 32, borderRadius: '50%',
                  bgcolor: '#fff', border: '2px solid #E5E5E5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', '&:hover': { bgcolor: '#F5F5F5' },
                }}>
                  <CameraIcon sx={{ fontSize: 16, color: '#888' }} />
                </Box>
              </Box>
              <Typography variant="h6" fontWeight={700}>{user?.name_ko || '사용자'}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {user?.department} {user?.position && `· ${user.position}`}
              </Typography>

              <Divider sx={{ my: 2.5 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary">역할</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ mb: 1.5 }}>
                  {user?.role === 'admin' ? '관리자' : user?.role === 'consultant' ? '상담사' : '일반 사용자'}
                </Typography>
                {user?.retirement_date && (
                  <>
                    <Typography variant="caption" color="text.secondary">퇴직일</Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1.5 }}>{user.retirement_date}</Typography>
                  </>
                )}
                {user?.skills?.length > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary">전문 분야</Typography>
                    <Typography variant="body2" fontWeight={500}>{user.skills.join(', ')}</Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>프로필 수정</Typography>

              {saved && <Alert severity="success" sx={{ mb: 2 }}>프로필이 저장되었습니다.</Alert>}

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="이름 (한글)" value={form.name_ko}
                    onChange={handleChange('name_ko')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="이름 (영문)" value={form.name_en}
                    onChange={handleChange('name_en')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="이메일" value={form.email}
                    onChange={handleChange('email')} disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="연락처" value={form.phone}
                    onChange={handleChange('phone')} placeholder="010-0000-0000" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="부서" value={form.department}
                    onChange={handleChange('department')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="직급" value={form.position}
                    onChange={handleChange('position')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="퇴직일" value={form.retirement_date}
                    onChange={handleChange('retirement_date')} placeholder="YYYY-MM-DD" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="전문 분야" value={form.skills}
                    onChange={handleChange('skills')} placeholder="쉼표로 구분 (예: 자산관리, 투자상담)" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="자기소개" multiline rows={3} value={form.bio}
                    onChange={handleChange('bio')} placeholder="간단한 자기소개를 입력하세요" />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" startIcon={<SaveIcon />}
                  onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중...' : '프로필 저장'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
