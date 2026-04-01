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
  Description as PolicyIcon,
  Home as HomeIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import { loadBranding, saveBranding, saveConfigToSupabase } from '../../utils/siteConfig';

const API_BASE = '/api';
const POLICIES_STORAGE_KEY = 'woori_policies';
const HOMEPAGE_ORDER_KEY = 'woori_homepage_order';

const DEFAULT_SECTION_ORDER = ['announcements', 'status', 'programs', 'jobs'];

const SECTION_LABELS = {
  announcements: '중요 공지사항',
  status: '나의 현황',
  programs: '진행 중인 프로그램',
  jobs: '추천 채용정보',
};

const loadSectionOrder = () => {
  try {
    const saved = localStorage.getItem(HOMEPAGE_ORDER_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_SECTION_ORDER;
};

const DEFAULT_POLICIES = {
  privacy: {
    title: '개인정보처리방침',
    updatedAt: '2024.05.01',
    content: '제1조 (개인정보의 처리 목적)\n\n우리은행 퇴직자 통합지원 플랫폼(이하 "플랫폼")은 다음의 목적을 위하여 개인정보를 처리합니다...',
  },
  terms: {
    title: '이용약관',
    updatedAt: '2024.05.01',
    content: '제1조 (목적)\n\n이 약관은 우리은행 퇴직자 통합지원 플랫폼(이하 "플랫폼")이 제공하는 모든 서비스의 이용조건 및 절차를 규정함을 목적으로 합니다...',
  },
};

const loadPolicies = () => {
  try {
    const saved = localStorage.getItem(POLICIES_STORAGE_KEY);
    if (saved) return { ...DEFAULT_POLICIES, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return DEFAULT_POLICIES;
};

const Settings = () => {
  const { showSuccess } = useNotification();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Policy management
  const [policies, setPolicies] = useState(loadPolicies);
  const [policySaving, setPolicySaving] = useState(false);

  // Homepage section order
  const [sectionOrder, setSectionOrder] = useState(loadSectionOrder);

  // Site branding
  const [branding, setBranding] = useState(loadBranding);

  // Microsoft SSO settings
  const [ssoConfig, setSsoConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('woori_sso_config');
      return saved ? JSON.parse(saved) : {
        enabled: false,
        googleSSOEnabled: false,
        clientId: '',
        clientSecret: '',
        tenantId: '',
        redirectUri: `${window.location.origin}/auth/microsoft/callback`,
        allowedDomains: '',
        autoProvision: true,
        defaultRole: 'user',
      };
    } catch { return { enabled: false, googleSSOEnabled: false, clientId: '', clientSecret: '', tenantId: '', redirectUri: `${window.location.origin}/auth/microsoft/callback`, allowedDomains: '', autoProvision: true, defaultRole: 'user' }; }
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
      // Save to localStorage + Supabase for cross-device sync
      await saveConfigToSupabase('woori_sso_config', ssoConfig);

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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }} variant="scrollable" scrollButtons="auto">
        <Tab icon={<BusinessIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="사이트 브랜딩" />
        <Tab icon={<MicrosoftIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Microsoft SSO" />
        <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="보안 설정" />
        <Tab icon={<PolicyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="약관 관리" />
        <Tab icon={<HomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="홈페이지 관리" />
      </Tabs>

      {/* Tab 0: Site Branding */}
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <BusinessIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>사이트 헤더 타이틀</Typography>
                <Typography variant="caption" color="text.secondary">
                  사이트 전체에 표시되는 헤더 타이틀을 한국어/영어로 설정합니다.
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>한국어 (Korean)</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth size="small" label="사이트 타이틀 (전체)"
                  value={branding.title_ko}
                  onChange={(e) => setBranding((p) => ({ ...p, title_ko: e.target.value }))}
                  helperText="헤더, 랜딩 페이지, 푸터에 표시됩니다"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth size="small" label="모바일용 축약 타이틀"
                  value={branding.title_short_ko}
                  onChange={(e) => setBranding((p) => ({ ...p, title_short_ko: e.target.value }))}
                  helperText="모바일 헤더에 표시됩니다"
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>영어 (English)</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth size="small" label="Site Title (Full)"
                  value={branding.title_en}
                  onChange={(e) => setBranding((p) => ({ ...p, title_en: e.target.value }))}
                  helperText="Displayed in header, landing page, and footer (English mode)"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth size="small" label="Short Title (Mobile)"
                  value={branding.title_short_en}
                  onChange={(e) => setBranding((p) => ({ ...p, title_short_en: e.target.value }))}
                  helperText="Displayed in mobile header"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained" startIcon={<SaveIcon />}
                onClick={async () => {
                  await saveBranding(branding);
                  showSuccess('사이트 브랜딩이 저장되었습니다. 페이지를 새로고침하면 반영됩니다.');
                }}
              >
                브랜딩 저장
              </Button>
            </Box>
          </Paper>

          {/* Preview */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>미리보기</Typography>
            <Box sx={{ bgcolor: '#0047BA', color: '#fff', p: 2, borderRadius: '8px', mb: 1 }}>
              <Typography variant="body1" fontWeight={700}>{branding.title_ko}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>모바일: {branding.title_short_ko}</Typography>
            </Box>
            <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: '8px' }}>
              <Typography variant="body1" fontWeight={700}>{branding.title_en}</Typography>
              <Typography variant="caption" color="text.secondary">Mobile: {branding.title_short_en}</Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Tab 1: Microsoft SSO */}
      {tab === 1 && (
        <Box>
          {/* Google SSO Toggle */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '8px', bgcolor: '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Box component="img" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" sx={{ width: 22, height: 22 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>Google SSO 로그인</Typography>
                  <Typography variant="caption" color="text.secondary">
                    로그인 페이지에서 Google 로그인 버튼 표시 여부
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={ssoConfig.googleSSOEnabled || false}
                    onChange={(e) => updateConfig('googleSSOEnabled', e.target.checked)}
                    color="primary"
                  />
                }
                label={ssoConfig.googleSSOEnabled ? '표시' : '숨김'}
              />
            </Box>
          </Paper>

          {/* Microsoft SSO */}
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
                  <option value="consultant">상담사</option>
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

      {/* Tab 2: Security Settings */}
      {tab === 2 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>보안 설정</Typography>
          <Typography variant="body2" color="text.secondary">
            추가 보안 설정은 추후 업데이트됩니다. (비밀번호 정책, 2단계 인증 등)
          </Typography>
        </Paper>
      )}

      {/* Tab 4: Homepage Management */}
      {tab === 4 && (
        <Box>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <HomeIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>홈페이지 섹션 순서</Typography>
                <Typography variant="caption" color="text.secondary">
                  드래그 또는 화살표 버튼으로 섹션 표시 순서를 변경합니다. 변경 사항은 즉시 홈페이지에 반영됩니다.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sectionOrder.map((key, index) => (
                <Paper key={key} elevation={0} sx={{
                  display: 'flex', alignItems: 'center', gap: 2, p: 2,
                  border: '1px solid', borderColor: 'divider', borderRadius: '10px',
                  bgcolor: '#FAFBFC',
                }}>
                  <DragIcon sx={{ color: '#bbb', fontSize: 20 }} />
                  <Chip label={index + 1} size="small" sx={{
                    minWidth: 28, height: 24, fontWeight: 700, fontSize: '0.75rem',
                    bgcolor: '#0047BA', color: '#fff',
                  }} />
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                    {SECTION_LABELS[key] || key}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" disabled={index === 0}
                      onClick={() => {
                        const newOrder = [...sectionOrder];
                        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                        setSectionOrder(newOrder);
                        saveConfigToSupabase(HOMEPAGE_ORDER_KEY, newOrder);
                        showSuccess('섹션 순서가 변경되었습니다.');
                      }}>
                      <ArrowUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" disabled={index === sectionOrder.length - 1}
                      onClick={() => {
                        const newOrder = [...sectionOrder];
                        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                        setSectionOrder(newOrder);
                        saveConfigToSupabase(HOMEPAGE_ORDER_KEY, newOrder);
                        showSuccess('섹션 순서가 변경되었습니다.');
                      }}>
                      <ArrowDownIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" size="small" onClick={() => {
                setSectionOrder(DEFAULT_SECTION_ORDER);
                saveConfigToSupabase(HOMEPAGE_ORDER_KEY, DEFAULT_SECTION_ORDER);
                showSuccess('기본 순서로 초기화되었습니다.');
              }}>
                기본 순서로 초기화
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Tab 3: Policy Management */}
      {tab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Privacy Policy */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <PolicyIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>개인정보처리방침</Typography>
                <Typography variant="caption" color="text.secondary">
                  사용자에게 표시되는 개인정보처리방침을 편집합니다. (경로: /policy/privacy)
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth label="제목" size="small" value={policies.privacy.title} sx={{ mb: 2 }}
              onChange={(e) => setPolicies((p) => ({ ...p, privacy: { ...p.privacy, title: e.target.value } }))}
            />
            <TextField
              fullWidth label="내용" multiline rows={12} value={policies.privacy.content}
              onChange={(e) => setPolicies((p) => ({ ...p, privacy: { ...p.privacy, content: e.target.value } }))}
              placeholder="개인정보처리방침 내용을 입력하세요..."
              sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
          </Paper>

          {/* Terms of Service */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <PolicyIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>이용약관</Typography>
                <Typography variant="caption" color="text.secondary">
                  사용자에게 표시되는 이용약관을 편집합니다. (경로: /policy/terms)
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth label="제목" size="small" value={policies.terms.title} sx={{ mb: 2 }}
              onChange={(e) => setPolicies((p) => ({ ...p, terms: { ...p.terms, title: e.target.value } }))}
            />
            <TextField
              fullWidth label="내용" multiline rows={12} value={policies.terms.content}
              onChange={(e) => setPolicies((p) => ({ ...p, terms: { ...p.terms, content: e.target.value } }))}
              placeholder="이용약관 내용을 입력하세요..."
              sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained" startIcon={<SaveIcon />}
              disabled={policySaving}
              onClick={() => {
                setPolicySaving(true);
                const now = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
                const updated = {
                  privacy: { ...policies.privacy, updatedAt: now },
                  terms: { ...policies.terms, updatedAt: now },
                };
                saveConfigToSupabase(POLICIES_STORAGE_KEY, updated);
                setPolicies(updated);
                showSuccess('약관이 저장되었습니다.');
                setPolicySaving(false);
              }}
            >
              {policySaving ? '저장 중...' : '약관 저장'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Settings;
