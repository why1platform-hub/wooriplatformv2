import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Paper, Radio, RadioGroup,
  FormControlLabel, Checkbox, Rating, Divider, Alert, Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Psychology as PsychIcon,
  Work as WorkIcon,
  TrendingUp as DirectionIcon,
  AccountBalance as FinanceIcon,
  Shield as ReadinessIcon,
  Star as ExpectIcon,
  Lock as ConsultantIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { getIntakeForm, saveIntakeForm } from '../../utils/consultationStore';

// ── Section header ──
const SectionHeader = ({ icon, num, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 3 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#0047BA', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
      {num}
    </Box>
    {icon}
    <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
  </Box>
);

const CheckboxGroup = ({ options, value = [], onChange, columns = 3 }) => (
  <Grid container spacing={1}>
    {options.map((opt) => (
      <Grid item xs={12 / columns} key={opt}>
        <FormControlLabel
          control={<Checkbox size="small" checked={value.includes(opt)} onChange={(e) => {
            onChange(e.target.checked ? [...value, opt] : value.filter((v) => v !== opt));
          }} />}
          label={<Typography variant="body2">{opt}</Typography>}
        />
      </Grid>
    ))}
  </Grid>
);

const RadioRow = ({ options, value, onChange, columns = 4 }) => (
  <RadioGroup value={value || ''} onChange={(e) => onChange(e.target.value)}>
    <Grid container spacing={1}>
      {options.map((opt) => (
        <Grid item xs={12 / columns} key={opt}>
          <FormControlLabel value={opt} control={<Radio size="small" />} label={<Typography variant="body2">{opt}</Typography>} />
        </Grid>
      ))}
    </Grid>
  </RadioGroup>
);

const EMPTY_FORM = {
  name: '', birthYear: '', residence: '', gender: '',
  company: '우리은행', lastRank: '', tenureYears: '', tenureMonths: '',
  education: '', retirementType: '',
  retirementDate: '', currentStatus: '',
  psychologicalState: [], currentSituation: '',
  mainDuties: '', longestRole: '', strengths: ['', '', ''],
  managementExp: '', managementSize: '', certifications: '', digitalLevel: '',
  desiredCareer: [], desiredField: '', desiredWorkType: '', desiredRegion: '', desiredTiming: '',
  desiredIncome: '', minimumIncome: '', workHours: '', travelAvailability: '', travelRestrictionReason: '',
  resumeStatus: '', difficulties: [], motivationLevel: 3,
  familySupport: '', healthStatus: '',
  expectations: [], preferredMethod: [], additionalRequests: '',
  consultantDiagnosisLevel: '', consultantRisks: '',
  recommendedTracks: [], nextGoals: '', consultantName: '',
};

/**
 * IntakeForm — Consultant fills this for each user.
 * Props:
 *   userId  – the user this form belongs to
 *   embedded – if true, renders without page chrome (for dialog embedding)
 *   onClose – callback after save (optional)
 */
const IntakeForm = ({ userId, embedded = false, onClose }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const existing = getIntakeForm(userId);
    if (existing) {
      setForm({ ...EMPTY_FORM, ...existing });
    } else {
      setForm(EMPTY_FORM);
    }
    setSaved(false);
  }, [userId]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateStrength = (idx, value) => {
    const arr = [...(form.strengths || ['', '', ''])];
    arr[idx] = value;
    update('strengths', arr);
  };

  const handleSave = () => {
    saveIntakeForm(userId, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const wrap = embedded ? Box : Paper;
  const wrapProps = embedded ? { sx: { p: 3 } } : { elevation: 0, sx: { p: 4, maxWidth: 900, mx: 'auto', borderRadius: '12px', border: '1px solid', borderColor: 'divider' } };

  return React.createElement(wrap, wrapProps,
    <>
      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>우리은행 퇴직자 전직지원 프로그램</Typography>
        <Typography variant="body2" color="text.secondary">퇴직자 초기상담 인테이크 양식</Typography>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 2 }}>저장되었습니다.</Alert>}

      {/* ① 기본 정보 */}
      <SectionHeader icon={<PersonIcon color="primary" fontSize="small" />} num="①" title="기본 정보 (Profile Intake)" />
      <Grid container spacing={2}>
        <Grid item xs={6}><TextField fullWidth size="small" label="성명 (또는 ID)" value={form.name} onChange={(e) => update('name', e.target.value)} /></Grid>
        <Grid item xs={6}><TextField fullWidth size="small" label="출생연도" value={form.birthYear} onChange={(e) => update('birthYear', e.target.value)} /></Grid>
        <Grid item xs={6}><TextField fullWidth size="small" label="거주 지역" value={form.residence} onChange={(e) => update('residence', e.target.value)} placeholder="ex) 서울시 강남구" /></Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">성별 (선택)</Typography>
          <RadioRow options={['남성', '여성', '미기재']} value={form.gender} onChange={(v) => update('gender', v)} columns={3} />
        </Grid>
        <Grid item xs={6}><TextField fullWidth size="small" label="퇴직 회사 / 업종" value={form.company} onChange={(e) => update('company', e.target.value)} /></Grid>
        <Grid item xs={6}><TextField fullWidth size="small" label="최종 직급" value={form.lastRank} onChange={(e) => update('lastRank', e.target.value)} /></Grid>
        <Grid item xs={4}><TextField fullWidth size="small" label="근속기간 (년)" value={form.tenureYears} onChange={(e) => update('tenureYears', e.target.value)} /></Grid>
        <Grid item xs={4}><TextField fullWidth size="small" label="근속기간 (개월)" value={form.tenureMonths} onChange={(e) => update('tenureMonths', e.target.value)} /></Grid>
        <Grid item xs={4}><TextField fullWidth size="small" label="최종학력" value={form.education} onChange={(e) => update('education', e.target.value)} /></Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">퇴직 유형</Typography>
          <RadioRow options={['희망퇴직', '정년퇴직', '권고사직', '기타']} value={form.retirementType} onChange={(v) => update('retirementType', v)} />
        </Grid>
      </Grid>

      {/* ② 퇴직 상황 및 현재 상태 진단 */}
      <SectionHeader icon={<PsychIcon color="primary" fontSize="small" />} num="②" title="퇴직 상황 및 현재 상태 진단" />
      <Grid container spacing={2}>
        <Grid item xs={6}><TextField fullWidth size="small" label="퇴직 시점" type="date" value={form.retirementDate} onChange={(e) => update('retirementDate', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">현재 상태</Typography>
          <RadioRow options={['재취업 준비', '휴식', '창업 준비', '진로 고민 단계']} value={form.currentStatus} onChange={(v) => update('currentStatus', v)} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">퇴직에 대한 현재 심리 상태 (복수 선택)</Typography>
          <CheckboxGroup options={['안정감', '불안', '기대감', '방향성 혼란', '경제적 부담', '기타']} value={form.psychologicalState} onChange={(v) => update('psychologicalState', v)} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth multiline rows={3} size="small" label="퇴직 후 현재까지의 상황 (자유 기술)" value={form.currentSituation} onChange={(e) => update('currentSituation', e.target.value)} />
        </Grid>
      </Grid>

      {/* ③ 경력 및 역량 파악 */}
      <SectionHeader icon={<WorkIcon color="primary" fontSize="small" />} num="③" title="경력 및 역량 파악 (Career Background)" />
      <Grid container spacing={2}>
        <Grid item xs={12}><TextField fullWidth multiline rows={3} size="small" label="주요 수행 업무 (자유 기술)" value={form.mainDuties} onChange={(e) => update('mainDuties', e.target.value)} /></Grid>
        <Grid item xs={12}><TextField fullWidth size="small" label="가장 오래 수행한 직무" value={form.longestRole} onChange={(e) => update('longestRole', e.target.value)} /></Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">본인이 강점이라 생각하는 역량 (최대 3가지)</Typography>
          <Grid container spacing={1} sx={{ mt: 0.5 }}>
            {[0, 1, 2].map((i) => (
              <Grid item xs={4} key={i}>
                <TextField fullWidth size="small" label={`${i + 1}번`} value={(form.strengths || [])[i] || ''} onChange={(e) => updateStrength(i, e.target.value)} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">관리자/팀장급 이상 경험</Typography>
          <RadioRow options={['있음', '없음']} value={form.managementExp} onChange={(v) => update('managementExp', v)} columns={2} />
          {form.managementExp === '있음' && (
            <TextField size="small" label="최대 인원" value={form.managementSize} onChange={(e) => update('managementSize', e.target.value)} sx={{ mt: 1 }} />
          )}
        </Grid>
        <Grid item xs={6}><TextField fullWidth size="small" label="보유 자격증 (주요 2~3개)" value={form.certifications} onChange={(e) => update('certifications', e.target.value)} /></Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">디지털 활용 수준</Typography>
          <RadioRow options={['낮음', '보통', '높음', '전문']} value={form.digitalLevel} onChange={(v) => update('digitalLevel', v)} />
        </Grid>
      </Grid>

      {/* ④ 향후 진로 방향 탐색 */}
      <SectionHeader icon={<DirectionIcon color="primary" fontSize="small" />} num="④" title="향후 진로 방향 탐색 (Career Direction)" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">희망 진로 (복수 선택)</Typography>
          <CheckboxGroup options={['재취업 (정규·계약직)', '파트타임 근무', '창업 / 소자본 창업', '프리랜서 / 컨설팅', '사회공헌 / 강의·코칭', '아직 미정']} value={form.desiredCareer} onChange={(v) => update('desiredCareer', v)} />
        </Grid>
        <Grid item xs={6}><TextField fullWidth size="small" label="희망 직무 / 분야" value={form.desiredField} onChange={(e) => update('desiredField', e.target.value)} /></Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">희망 근무 형태</Typography>
          <RadioRow options={['정규직', '계약직', '시간제 (파트타임)', '프로젝트형 (단기)']} value={form.desiredWorkType} onChange={(v) => update('desiredWorkType', v)} />
        </Grid>
        <Grid item xs={6}><TextField fullWidth size="small" label="희망 근무 지역" value={form.desiredRegion} onChange={(e) => update('desiredRegion', e.target.value)} /></Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">재취업 희망 시기</Typography>
          <RadioRow options={['즉시', '3개월 내', '6개월 내', '미정']} value={form.desiredTiming} onChange={(v) => update('desiredTiming', v)} />
        </Grid>
      </Grid>

      {/* ⑤ 경제적 기대 수준 */}
      <SectionHeader icon={<FinanceIcon color="primary" fontSize="small" />} num="⑤" title="경제적 기대 수준" />
      <Grid container spacing={2}>
        <Grid item xs={6}><TextField fullWidth size="small" label="희망 월 소득 수준 (만 원)" value={form.desiredIncome} onChange={(e) => update('desiredIncome', e.target.value)} /></Grid>
        <Grid item xs={6}><TextField fullWidth size="small" label="최소 수용 가능 소득 (만 원)" value={form.minimumIncome} onChange={(e) => update('minimumIncome', e.target.value)} /></Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">근로시간 수용 범위</Typography>
          <RadioRow options={['풀타임', '파트타임', '유연근무']} value={form.workHours} onChange={(v) => update('workHours', v)} columns={3} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">출장/이동 가능 여부</Typography>
          <RadioRow options={['가능', '제한적', '불가']} value={form.travelAvailability} onChange={(v) => update('travelAvailability', v)} columns={3} />
          {form.travelAvailability === '불가' && (
            <TextField size="small" label="이유" value={form.travelRestrictionReason} onChange={(e) => update('travelRestrictionReason', e.target.value)} sx={{ mt: 1 }} fullWidth />
          )}
        </Grid>
      </Grid>

      {/* ⑥ 준비도 및 장애요인 진단 */}
      <SectionHeader icon={<ReadinessIcon color="primary" fontSize="small" />} num="⑥" title="준비도 및 장애요인 진단" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">구직 준비 수준</Typography>
          <RadioRow options={['이력서 있음 (최신 버전)', '이력서 있음 (업데이트 필요)', '이력서 없음 (작성 지원 필요)', '포트폴리오 보유']} value={form.resumeStatus} onChange={(v) => update('resumeStatus', v)} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">현재 느끼는 어려움 요소 (복수 선택)</Typography>
          <CheckboxGroup options={['정보 부족', '자신감 부족', '연령 장벽 우려', '네트워크 부족', '디지털 역량 부족', '건강 문제', '가족 상황', '기타']} value={form.difficulties} onChange={(v) => update('difficulties', v)} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">구직 의욕 수준 (자기 평가)</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="caption">매우 낮음</Typography>
            <Rating value={form.motivationLevel} onChange={(_, v) => update('motivationLevel', v)} />
            <Typography variant="caption">매우 높음</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">가족의 지지 여부</Typography>
          <RadioRow options={['적극 지지', '보통', '반대 또는 우려']} value={form.familySupport} onChange={(v) => update('familySupport', v)} columns={3} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">건강 상태 (근무 가능 수준)</Typography>
          <RadioRow options={['양호', '관리 중', '제약 있음']} value={form.healthStatus} onChange={(v) => update('healthStatus', v)} columns={3} />
        </Grid>
      </Grid>

      {/* ⑦ 프로그램 기대사항 */}
      <SectionHeader icon={<ExpectIcon color="primary" fontSize="small" />} num="⑦" title="프로그램 기대사항 (Needs Assessment)" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">이번 프로그램에서 가장 기대하는 것 (복수 선택)</Typography>
          <CheckboxGroup options={['취업 연계', '진로 설계·탐색', '심리 안정·회복', '교육 / 재교육', '네트워킹', '창업 지원']} value={form.expectations} onChange={(v) => update('expectations', v)} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">선호 지원 방식 (복수 선택)</Typography>
          <CheckboxGroup options={['1:1 개인 상담', '그룹 교육 (소규모)', '온라인 진행', '오프라인 대면', '혼합형 (온·오프라인)']} value={form.preferredMethod} onChange={(v) => update('preferredMethod', v)} columns={3} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth multiline rows={3} size="small" label="프로그램에 바라는 점 / 기타 요청사항" value={form.additionalRequests} onChange={(e) => update('additionalRequests', e.target.value)} />
        </Grid>
      </Grid>

      {/* ⑧ 상담사 기록 영역 */}
      <Divider sx={{ my: 3 }} />
      <SectionHeader icon={<ConsultantIcon color="error" fontSize="small" />} num="⑧" title="상담사 기록 영역 [상담사 전용 — 참가자 비공개]" />
      <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>이 영역은 상담사만 기록합니다. 참가자에게 공개하지 않습니다.</Alert>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>초기 진단 레벨</Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {[
              { grade: 'A', label: '즉시 취업 가능', color: '#059669' },
              { grade: 'B', label: '재정비 필요', color: '#0047BA' },
              { grade: 'C', label: '진로 탐색 필요', color: '#EA580C' },
              { grade: 'D', label: '심리 지원 우선', color: '#DC2626' },
            ].map((g) => (
              <Paper
                key={g.grade} elevation={0}
                onClick={() => update('consultantDiagnosisLevel', g.grade)}
                sx={{
                  flex: 1, p: 1.5, textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                  border: '2px solid',
                  borderColor: form.consultantDiagnosisLevel === g.grade ? g.color : '#E5E7EB',
                  bgcolor: form.consultantDiagnosisLevel === g.grade ? `${g.color}10` : '#fff',
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ color: g.color }}>{g.grade}</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{g.label}</Typography>
              </Paper>
            ))}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth multiline rows={2} size="small" label="주요 리스크 및 특이사항" value={form.consultantRisks} onChange={(e) => update('consultantRisks', e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">추천 트랙</Typography>
          <CheckboxGroup options={['재취업 집중 트랙', '창업·프리랜서 트랙', '교육·재훈련 트랙', '심리 안정 우선 트랙', '생애설계 트랙']} value={form.recommendedTracks} onChange={(v) => update('recommendedTracks', v)} columns={3} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth multiline rows={2} size="small" label="다음 상담 목표 / 액션 아이템" value={form.nextGoals} onChange={(e) => update('nextGoals', e.target.value)} />
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth size="small" label="상담사 서명" value={form.consultantName} onChange={(e) => update('consultantName', e.target.value)} />
        </Grid>
      </Grid>

      {/* Save */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSave} sx={{ px: 6 }}>
          저장하기
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2, fontSize: '0.7rem' }}>
        본 양식에 기재된 정보는 전직지원 프로그램 운영 목적으로만 활용되며, 개인정보보호법에 따라 엄격히 관리됩니다.
        수집된 정보는 서비스 종료 후 5년간 보관 후 파기됩니다. | 퍼솔코리아 유한회사
      </Typography>
    </>
  );
};

export default IntakeForm;
