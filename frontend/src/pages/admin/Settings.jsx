import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Switch, FormControlLabel,
  Grid, Divider, Alert, Chip, Tabs, Tab, IconButton, InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Window as MicrosoftIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const API_BASE = '/api';

const Settings = () => {
  const { showSuccess, showError } = useNotification();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Microsoft SSO settings
  const [ssoConfig, setSsoConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('woori_sso_config');
      return saved ? JSON.parse(saved) : {
        enabled: false,
        clientId: '',
        clientSecret: '',
        tenantId: '',
        redirectUri: `${window.location.origin}/auth/microsoft/callback`,
        allowedDomains: '',
        autoProvision: true,
        defaultRole: 'user',
      };
    } catch { return { enabled: false, clientId: '', clientSecret: '', tenantId: '', redirectUri: `${window.location.origin}/auth/microsoft/callback`, allowedDomains: '', autoProvision: true, defaultRole: 'user' }; }
  });

  const [showSecret, setShowSecret] = useState(false);

  // Load SSO config from backend on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('woori_token');
        const response = await fetch(`${API_BASE}/auth/sso-config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.config) {
            setSsoConfig((prev) => ({ ...prev, ...data.config }));
          }
        }
      } catch {
        // Use localStorage fallback
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage for immediate use
      localStorage.setItem('woori_sso_config', JSON.stringify(ssoConfig));

      // Try saving to backend
      const token = localStorage.getItem('woori_token');
      await fetch(`${API_BASE}/auth/sso-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ config: ssoConfig }),
      });

      showSuccess('SSO 설정이 저장되었습니다.');
    } catch {
      // Saved to localStorage at least
      showSuccess('SSO 설정이 로컬에 저장되었습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (!ssoConfig.clientId || !ssoConfig.tenantId) {
        setTestResult({ success: false, message: 'Client ID와 Tenant ID를 입력해주세요.' });
        return;
      }
      // Test by checking Microsoft's OpenID configuration endpoint
      const response = await fetch(
        `https://login.microsoftonline.com/${ssoConfig.tenantId}/v2.0/.well-known/openid-configuration`
      );
      if (response.ok) {
        setTestResult({ success: true, message: 'Microsoft Entra ID 연결이 확인되었습니다.' });
      } else {
        setTestResult({ success: false, message: 'Tenant ID를 확인해주세요. Microsoft 서버에 연결할 수 없습니다.' });
      }
    } catch {
      setTestResult({ success: false, message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setTesting(false);
    }
  };

  const updateConfig = (field, value) => {
    setSsoConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>시스템 설정</Typography>
        <Typography variant="body2" color="text.secondary">SSO 및 인증 설정을 관리합니다.</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab icon={<MicrosoftIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Microsoft SSO" />
        <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="보안 설정" />
      </Tabs>

      {/* Tab 0: Microsoft SSO */}
      {tab === 0 && (
        <Box>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00A4EF 0%, #0078D4 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MicrosoftIcon sx={{ color: '#fff', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>Microsoft Entra ID (Azure AD) SSO</Typography>
                  <Typography variant="caption" color="text.secondary">
                    고객사 Microsoft 계정으로 Single Sign-On 연동
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={ssoConfig.enabled}
                    onChange={(e) => updateConfig('enabled', e.target.checked)}
                    color="primary"
                  />
                }
                label={ssoConfig.enabled ? '활성화' : '비활성화'}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon fontSize="small" /> Azure App Registration 정보
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Application (Client) ID"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={ssoConfig.clientId}
                  onChange={(e) => updateConfig('clientId', e.target.value)}
                  helperText="Azure Portal > App registrations에서 확인"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Directory (Tenant) ID"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={ssoConfig.tenantId}
                  onChange={(e) => updateConfig('tenantId', e.target.value)}
                  helperText="고객사 Azure AD 테넌트 ID"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client Secret"
                  type={showSecret ? 'text' : 'password'}
                  value={ssoConfig.clientSecret}
                  onChange={(e) => updateConfig('clientSecret', e.target.value)}
                  helperText="Certificates & secrets에서 생성"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowSecret(!showSecret)}>
                          {showSecret ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Redirect URI"
                  value={ssoConfig.redirectUri}
                  onChange={(e) => updateConfig('redirectUri', e.target.value)}
                  helperText="Azure App에 등록된 Redirect URI와 동일해야 합니다"
                  size="small"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon fontSize="small" /> 접근 제어 설정
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="허용 도메인"
                  placeholder="wooribank.com, woori.co.kr"
                  value={ssoConfig.allowedDomains}
                  onChange={(e) => updateConfig('allowedDomains', e.target.value)}
                  helperText="쉼표로 구분. 비워두면 모든 도메인 허용"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="기본 사용자 역할"
                  select
                  value={ssoConfig.defaultRole}
                  onChange={(e) => updateConfig('defaultRole', e.target.value)}
                  size="small"
                  SelectProps={{ native: true }}
                >
                  <option value="user">일반 사용자</option>
                  <option value="instructor">강사</option>
                  <option value="hr_manager">HR 매니저</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ssoConfig.autoProvision}
                      onChange={(e) => updateConfig('autoProvision', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>자동 계정 생성</Typography>
                      <Typography variant="caption" color="text.secondary">
                        SSO 로그인 시 계정이 없으면 자동으로 생성합니다
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Test result */}
            {testResult && (
              <Alert
                severity={testResult.success ? 'success' : 'error'}
                icon={testResult.success ? <CheckIcon /> : <ErrorIcon />}
                sx={{ mb: 2 }}
                onClose={() => setTestResult(null)}
              >
                {testResult.message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={testing || !ssoConfig.tenantId}
              >
                {testing ? '연결 테스트 중...' : '연결 테스트'}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '저장 중...' : '설정 저장'}
              </Button>
            </Box>
          </Paper>

          {/* Setup Guide */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Microsoft Entra ID 설정 가이드
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { step: 1, text: 'Azure Portal (portal.azure.com)에 로그인합니다.' },
                { step: 2, text: 'Microsoft Entra ID > App registrations > New registration을 선택합니다.' },
                { step: 3, text: `Redirect URI에 "${ssoConfig.redirectUri}"를 입력합니다.` },
                { step: 4, text: 'Application (Client) ID와 Directory (Tenant) ID를 위 설정에 입력합니다.' },
                { step: 5, text: 'Certificates & secrets에서 New client secret을 생성하고 위에 입력합니다.' },
                { step: 6, text: 'API permissions에서 "User.Read" 권한을 추가합니다.' },
              ].map((item) => (
                <Box key={item.step} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Chip
                    label={item.step}
                    size="small"
                    sx={{ minWidth: 28, height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#0078D4', color: '#fff' }}
                  />
                  <Typography variant="body2">{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Tab 1: Security Settings */}
      {tab === 1 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>보안 설정</Typography>
          <Typography variant="body2" color="text.secondary">
            추가 보안 설정은 추후 업데이트됩니다. (비밀번호 정책, 2단계 인증 등)
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Settings;
