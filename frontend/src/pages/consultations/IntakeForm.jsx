import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Divider,
  Alert,
  Chip,
  Rating,
  MenuItem,
  Select,
  InputLabel,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  WorkHistory as CareerIcon,
  Explore as DirectionIcon,
  AccountBalance as MoneyIcon,
  Assessment as ReadinessIcon,
  Star as ExpectationIcon,
  Lock as LockIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const INTAKE_STORAGE_KEY = 'woori_intake_forms';

// ─── Helpers ─────────────────────────────────
const loadIntakeForms = () => {
  try {
    const saved = localStorage.getItem(INTAKE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

const saveIntakeForm = (userId, data) => {
  const forms = loadIntakeForms();
  forms[userId] = { ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(forms));
};

export const getIntakeForm = (userId) => {
  const forms = loadIntakeForms();
  return forms[userId] || null;
};

export const hasIntakeForm = (userId) => {
  return !!getIntakeForm(userId);
};

// ─── Section components ─────────────────────────────────
const SectionHeader = ({ icon, number, title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
    <Box sx={{
      width: 40, height: 40, borderRadius: '10px', bgcolor: '#EBF0FA',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {React.cloneElement(icon, { sx: { fontSize: 22, color: '#0047BA' } })}
    </Box>
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
        {number} {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      )}
    </Box>
  </Box>
);

const CheckboxGroup = ({ label, options, value = [], onChange, columns = 3 }) => (
  <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
    <FormLabel sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem', color: 'text.primary' }}>
      {label}
    </FormLabel>
    <FormGroup>
      <Grid container spacing={0.5}>
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          return (
            <Grid item xs={12} sm={12 / Math.min(columns, 3)} key={optValue}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={value.includes(optValue)}
                    onChange={(e) => {
                      if (e.target.checked) onChange([...value, optValue]);
                      else onChange(value.filter((v) => v !== optValue));
                    }}
                  />
                }
                label={<Typography variant="body2">{optLabel}</Typography>}
              />
            </Grid>
          );
        })}
      </Grid>
    </FormGroup>
  </FormControl>
);

const RadioRow = ({ label, options, value, onChange, columns = 4 }) => (
  <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
    <FormLabel sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem', color: 'text.primary' }}>
      {label}
    </FormLabel>
    <RadioGroup value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <Grid container spacing={0.5}>
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          return (
            <Grid item xs={6} sm={12 / Math.min(columns, 4)} key={optValue}>
              <FormControlLabel
                value={optValue}
                control={<Radio size="small" />}
                label={<Typography variant="body2">{optLabel}</Typography>}
              />
            </Grid>
          );
        })}
      </Grid>
    </RadioGroup>
  </FormControl>
);

// ─── Default form state ─────────────────────────────────
const defaultFormData = {
  // Section 1: Profile
  name: '',
  birthYear: '',
  residence: '',
  gender: '',
  company: '우리은행',
  lastRank: '',
  tenureYears: '',
  tenureMonths: '',
  education: '',
  retirementType: '',

  // Section 2: Current Status
  retirementDate: '',
  currentStatus: '',
  psychologicalState: [],
  currentSituation: '',

  // Section 3: Career Background
  mainDuties: '',
  longestRole: '',
  strengths: ['', '', ''],
  managementExp: '',
  managementSize: '',
  certifications: '',
  digitalLevel: '',

  // Section 4: Career Direction
  desiredCareer: [],
  desiredField: '',
  desiredWorkType: '',
  desiredRegion: '',
  desiredTiming: '',

  // Section 5: Financial Expectations
  desiredIncome: '',
  minimumIncome: '',
  workHours: '',
  travelAvailability: '',
  travelRestrictionReason: '',

  // Section 6: Readiness
  resumeStatus: '',
  difficulties: [],
  motivationLevel: 3,
  familySupport: '',
  healthStatus: '',

  // Section 7: Program Expectations
  expectations: [],
  preferredMethod: [],
  additionalRequests: '',

  // Section 8: Consultant Only
  consultantDiagnosisLevel: '',
  consultantRisks: '',
  recommendedTracks: [],
  nextGoals: '',
  nextConsultationDate: '',
  consultantName: '',
};

// ─── Main Component ─────────────────────────────────
const IntakeForm = ({ mode = 'user', userId: propUserId, onComplete }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const { showSuccess } = useNotification();

  const isConsultantMode = mode === 'consultant' || searchParams.get('mode') === 'consultant';
  const targetUserId = propUserId || searchParams.get('userId') || user?.id;

  const [formData, setFormData] = useState(defaultFormData);
  const [saved, setSaved] = useState(false);
  const [existingForm, setExistingForm] = useState(false);

  // Load existing form data
  useEffect(() => {
    if (targetUserId) {
      const existing = getIntakeForm(targetUserId);
      if (existing) {
        setFormData((prev) => ({ ...prev, ...existing }));
        setExistingForm(true);
      }
      // Pre-fill from user profile
      if (user && !existing) {
        setFormData((prev) => ({
          ...prev,
          name: user.name_ko || user.name_en || '',
          company: '우리은행',
          retirementDate: user.retirement_date || '',
        }));
      }
    }
  }, [targetUserId, user]);

  const update = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const updateStrength = (index, value) => {
    setFormData((prev) => {
      const strengths = [...prev.strengths];
      strengths[index] = value;
      return { ...prev, strengths };
    });
  };

  const handleSave = () => {
    saveIntakeForm(targetUserId, formData);
    setSaved(true);
    showSuccess(existingForm ? '인테이크 양식이 업데이트되었습니다.' : '인테이크 양식이 저장되었습니다.');
    if (onComplete) onComplete();
  };

  if (saved && !isConsultantMode) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CheckIcon sx={{ fontSize: 64, color: '#059669', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          인테이크 양식이 {existingForm ? '업데이트' : '제출'}되었습니다
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          상담사가 귀하의 정보를 기반으로 맞춤 상담을 준비합니다.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/activities/consultations')}>
            내 상담 내역
          </Button>
          <Button variant="contained" onClick={() => navigate('/')}>
            홈으로
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          {isConsultantMode ? '인테이크 상담 양식 (상담사 모드)' : '퇴직자 초기상담 인테이크 양식'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Career Transition Outplacement — Intake Form
        </Typography>
        {existingForm && (
          <Alert severity="info" sx={{ mt: 1.5 }}>
            이미 작성된 양식이 있습니다. 내용을 수정한 후 저장할 수 있습니다.
          </Alert>
        )}
      </Box>

      {/* ─── Section 1: 기본 정보 ─── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader icon={<PersonIcon />} number="①" title="기본 정보" subtitle="Profile Intake" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="성명 (또는 ID)" value={formData.name} onChange={update('name')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="출생연도" placeholder="예: 1968" value={formData.birthYear} onChange={update('birthYear')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="거주 지역" placeholder="예: 서울시 강남구" value={formData.residence} onChange={update('residence')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RadioRow
                label="성별 (선택)"
                options={['남성', '여성', '미기재']}
                value={formData.gender}
                onChange={update('gender')}
                columns={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="퇴직 회사 / 업종" value={formData.company} onChange={update('company')} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="최종 직급" value={formData.lastRank} onChange={update('lastRank')} />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField fullWidth size="small" label="근속기간 (년)" type="number" value={formData.tenureYears} onChange={update('tenureYears')} />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField fullWidth size="small" label="근속기간 (개월)" type="number" value={formData.tenureMonths} onChange={update('tenureMonths')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="최종학력" value={formData.education} onChange={update('education')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RadioRow
                label="퇴직 유형"
                options={['희망퇴직', '정년퇴직', '권고사직', '기타']}
                value={formData.retirementType}
                onChange={update('retirementType')}
                columns={4}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─── Section 2: 퇴직 상황 및 현재 상태 ─── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader icon={<PsychologyIcon />} number="②" title="퇴직 상황 및 현재 상태 진단" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="퇴직 시점" type="date" InputLabelProps={{ shrink: true }} value={formData.retirementDate} onChange={update('retirementDate')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RadioRow
                label="현재 상태"
                options={['재취업 준비', '휴식', '창업 준비', '진로 고민 단계']}
                value={formData.currentStatus}
                onChange={update('currentStatus')}
                columns={2}
              />
            </Grid>
            <Grid item xs={12}>
              <CheckboxGroup
                label="퇴직에 대한 현재 심리 상태 (복수 선택 가능)"
                options={['안정감', '불안', '기대감', '방향성 혼란', '경제적 부담', '기타']}
                value={formData.psychologicalState}
                onChange={update('psychologicalState')}
                columns={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" multiline rows={3}
                label="퇴직 후 현재까지의 상황 (자유 기술)"
                placeholder="퇴직 후 어떤 활동을 하셨는지, 현재 어떤 고민이 있는지 자유롭게 작성해주세요."
                value={formData.currentSituation}
                onChange={update('currentSituation')}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─── Section 3: 경력 및 역량 ─── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader icon={<CareerIcon />} number="③" title="경력 및 역량 파악" subtitle="Career Background" />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" multiline rows={3}
                label="주요 수행 업무 (자유 기술)"
                placeholder="재직 중 주로 수행한 업무를 기술해주세요."
                value={formData.mainDuties}
                onChange={update('mainDuties')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="가장 오래 수행한 직무" value={formData.longestRole} onChange={update('longestRole')} />
            </Grid>
            <Grid item xs={12}>
              <FormLabel sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem', color: 'text.primary', display: 'block' }}>
                본인이 강점이라 생각하는 역량 (최대 3가지)
              </FormLabel>
              <Grid container spacing={1.5}>
                {[0, 1, 2].map((i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <TextField
                      fullWidth size="small"
                      label={`강점 ${i + 1}`}
                      value={formData.strengths[i] || ''}
                      onChange={(e) => updateStrength(i, e.target.value)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormLabel sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem', color: 'text.primary', display: 'block' }}>
                관리자 / 팀장급 이상 경험
              </FormLabel>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <RadioGroup row value={formData.managementExp || ''} onChange={update('managementExp')}>
                  <FormControlLabel value="있음" control={<Radio size="small" />} label={<Typography variant="body2">있음</Typography>} />
                  <FormControlLabel value="없음" control={<Radio size="small" />} label={<Typography variant="body2">없음</Typography>} />
                </RadioGroup>
                {formData.managementExp === '있음' && (
                  <TextField size="small" label="최대 인원" sx={{ width: 120 }} value={formData.managementSize} onChange={update('managementSize')} />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="보유 자격증 (주요 2~3개)" placeholder="예: CFP, 공인중개사" value={formData.certifications} onChange={update('certifications')} />
            </Grid>
            <Grid item xs={12}>
              <RadioRow
                label="디지털 활용 수준"
                options={[
                  { value: '낮음', label: '낮음 (기본 PC 수준)' },
                  { value: '보통', label: '보통 (엑셀·인터넷 활용)' },
                  { value: '높음', label: '높음 (디지털 툴·SNS 활용)' },
                  { value: '전문', label: '전문 (데이터·IT 계열)' },
                ]}
                value={formData.digitalLevel}
                onChange={update('digitalLevel')}
                columns={2}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─── Section 4: 향후 진로 방향 ─── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader icon={<DirectionIcon />} number="④" title="향후 진로 방향 탐색" subtitle="Career Direction" />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CheckboxGroup
                label="희망 진로 (복수 선택 가능)"
                options={['재취업 (정규·계약직)', '파트타임 근무', '창업 / 소자본 창업', '프리랜서 / 컨설팅', '사회공헌 / 강의·코칭', '아직 미정']}
                value={formData.desiredCareer}
                onChange={update('desiredCareer')}
                columns={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="희망 직무 / 분야" placeholder="예: 금융컨설팅, 부동산 자문, 교육 강사" value={formData.desiredField} onChange={update('desiredField')} />
            </Grid>
            <Grid item xs={12}>
              <RadioRow
                label="희망 근무 형태"
                options={['정규직', '계약직', '시간제 (파트타임)', '프로젝트형 (단기)']}
                value={formData.desiredWorkType}
                onChange={update('desiredWorkType')}
                columns={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="희망 근무 지역" placeholder="예: 서울, 경기" value={formData.desiredRegion} onChange={update('desiredRegion')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RadioRow
                label="재취업 희망 시기"
                options={['즉시', '3개월 내', '6개월 내', '미정']}
                value={formData.desiredTiming}
                onChange={update('desiredTiming')}
                columns={4}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─── Section 5: 경제적 기대 수준 ─── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader icon={<MoneyIcon />} number="⑤" title="경제적 기대 수준" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="희망 월 소득 수준" placeholder="예: 300만 원 이상" value={formData.desiredIncome} onChange={update('desiredIncome')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="최소 수용 가능 소득" placeholder="예: 200만 원 이상" value={formData.minimumIncome} onChange={update('minimumIncome')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RadioRow
                label="근로시간 수용 범위"
                options={['풀타임 (주 40시간)', '파트타임', '유연근무']}
                value={formData.workHours}
                onChange={update('workHours')}
                columns={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormLabel sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem', color: 'text.primary', display: 'block' }}>
                출장 / 이동 가능 여부
              </FormLabel>
              <RadioGroup row value={formData.travelAvailability || ''} onChange={update('travelAvailability')}>
                <FormControlLabel value="가능" control={<Radio size="small" />} label={<Typography variant="body2">가능</Typography>} />
                <FormControlLabel value="제한적" control={<Radio size="small" />} label={<Typography variant="body2">제한적</Typography>} />
                <FormControlLabel value="불가" control={<Radio size="small" />} label={<Typography variant="body2">불가</Typography>} />
              </RadioGroup>
              {formData.travelAvailability === '불가' && (
                <TextField size="small" fullWidth label="사유" sx={{ mt: 1 }} value={formData.travelRestrictionReason} onChange={update('travelRestrictionReason')} />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─── Section 6: 준비도 및 장애요인 ─── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader icon={<ReadinessIcon />} number="⑥" title="준비도 및 장애요인 진단" />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RadioRow
                label="구직 준비 수준 (이력서 보유 여부)"
                options={[
                  '이력서 있음 (최신 버전)',
                  '이력서 있음 (업데이트 필요)',
                  '이력서 없음 (작성 지원 필요)',
                  '포트폴리오 보유',
                ]}
                value={formData.resumeStatus}
                onChange={update('resumeStatus')}
                columns={2}
              />
            </Grid>
            <Grid item xs={12}>
              <CheckboxGroup
                label="현재 느끼는 어려움 요소 (복수 선택 가능)"
                options={['정보 부족', '자신감 부족', '연령 장벽 우려', '네트워크 부족', '디지털 역량 부족', '건강 문제', '가족 상황', '기타']}
                value={formData.difficulties}
                onChange={update('difficulties')}
                columns={4}
              />
            </Grid>
            <Grid item xs={12}>
              <FormLabel sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem', color: 'text.primary', display: 'block' }}>
                구직 의욕 수준 (자기 평가)
              </FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">매우 낮음</Typography>
                <Rating
                  value={formData.motivationLevel}
                  onChange={(_, v) => update('motivationLevel')(v)}
                  max={5}
                  size="large"
                />
                <Typography variant="caption" color="text.secondary">매우 높음</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <RadioRow
                label="가족의 지지 여부"
                options={['적극 지지', '보통', '반대 또는 우려']}
                value={formData.familySupport}
                onChange={update('familySupport')}
                columns={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RadioRow
                label="건강 상태 (근무 가능 수준)"
                options={['양호', '관리 중', '제약 있음']}
                value={formData.healthStatus}
                onChange={update('healthStatus')}
                columns={3}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─── Section 7: 프로그램 기대사항 ─── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader icon={<ExpectationIcon />} number="⑦" title="프로그램 기대사항" subtitle="Needs Assessment" />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CheckboxGroup
                label="이번 프로그램에서 가장 기대하는 것 (복수 선택)"
                options={['취업 연계', '진로 설계·탐색', '심리 안정·회복', '교육 / 재교육', '네트워킹', '창업 지원']}
                value={formData.expectations}
                onChange={update('expectations')}
                columns={3}
              />
            </Grid>
            <Grid item xs={12}>
              <CheckboxGroup
                label="선호 지원 방식 (복수 선택)"
                options={['1:1 개인 상담', '그룹 교육 (소규모)', '온라인 진행', '오프라인 대면', '혼합형 (온·오프라인)']}
                value={formData.preferredMethod}
                onChange={update('preferredMethod')}
                columns={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" multiline rows={3}
                label="프로그램에 바라는 점 / 기타 요청사항 (자유 기술)"
                placeholder="기타 요청사항이 있으시면 자유롭게 작성해주세요."
                value={formData.additionalRequests}
                onChange={update('additionalRequests')}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─── Section 8: 상담사 전용 (Consultant Only) ─── */}
      {isConsultantMode && (
        <Card sx={{ mb: 2.5, border: '2px solid #DC2626' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <SectionHeader icon={<LockIcon />} number="⑧" title="상담사 기록 영역" subtitle="상담사 전용 — 참가자 비공개" />
            <Alert severity="warning" sx={{ mb: 2.5 }}>
              이 영역은 상담사만 기록합니다. 참가자에게 공개되지 않습니다.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormLabel sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.875rem', color: 'text.primary', display: 'block' }}>
                  초기 진단 레벨
                </FormLabel>
                <Grid container spacing={1.5}>
                  {[
                    { value: 'A', label: 'A등급', desc: '즉시 취업 가능', color: '#059669' },
                    { value: 'B', label: 'B등급', desc: '재정비 필요', color: '#0047BA' },
                    { value: 'C', label: 'C등급', desc: '진로 탐색 필요', color: '#D97706' },
                    { value: 'D', label: 'D등급', desc: '심리 지원 우선', color: '#DC2626' },
                  ].map((level) => (
                    <Grid item xs={6} sm={3} key={level.value}>
                      <Paper
                        elevation={0}
                        onClick={() => update('consultantDiagnosisLevel')(level.value)}
                        sx={{
                          p: 2, textAlign: 'center', cursor: 'pointer',
                          border: '2px solid',
                          borderColor: formData.consultantDiagnosisLevel === level.value ? level.color : '#E5E5E5',
                          bgcolor: formData.consultantDiagnosisLevel === level.value ? `${level.color}08` : '#fff',
                          borderRadius: '10px', transition: 'all 0.15s',
                          '&:hover': { borderColor: level.color },
                        }}
                      >
                        <Typography variant="h6" fontWeight={800} sx={{ color: level.color }}>{level.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{level.desc}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth size="small" multiline rows={3}
                  label="주요 리스크 및 특이사항"
                  value={formData.consultantRisks}
                  onChange={update('consultantRisks')}
                />
              </Grid>
              <Grid item xs={12}>
                <CheckboxGroup
                  label="추천 트랙 (복수 선택)"
                  options={['재취업 집중 트랙', '창업·프리랜서 트랙', '교육·재훈련 트랙', '심리 안정 우선 트랙', '생애설계 트랙']}
                  value={formData.recommendedTracks}
                  onChange={update('recommendedTracks')}
                  columns={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth size="small" multiline rows={2}
                  label="다음 상담 목표 / 액션 아이템"
                  value={formData.nextGoals}
                  onChange={update('nextGoals')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                  label="다음 상담 예정일"
                  value={formData.nextConsultationDate}
                  onChange={update('nextConsultationDate')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="상담사명" value={formData.consultantName} onChange={update('consultantName')} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#F8F9FA', borderRadius: '10px', border: '1px solid #EAEDF0' }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          본 양식에 기재된 정보는 전직지원 프로그램 운영 목적으로만 활용되며, 개인정보보호법에 따라 엄격히 관리됩니다.
          수집된 정보는 서비스 종료 후 5년간 보관 후 파기됩니다.
        </Typography>
      </Paper>

      {/* Submit */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          취소
        </Button>
        <Button
          variant="contained" size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ px: 4 }}
        >
          {existingForm ? '수정 저장' : '제출하기'}
        </Button>
      </Box>
    </Box>
  );
};

export default IntakeForm;
