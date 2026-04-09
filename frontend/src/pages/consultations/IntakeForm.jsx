import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Radio, RadioGroup,
  FormControlLabel, Checkbox, Alert, Table, TableBody, TableRow, TableCell,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { getIntakeForm, saveIntakeForm } from '../../utils/consultationStore';

// ── Color constants matching the docx ──
const COLORS = {
  headerBg: '#215E99',
  headerText: '#fff',
  mandatoryBg: '#B3E5A1',
  optionalBg: '#DAE9F7',
  inputBg: '#fff',
  topBannerBg: '#0A1929',
  metaRowBg: '#F0F0F0',
  borderColor: '#999',
};

// ── Reusable table cell styles ──
const cellSx = (bg, opts = {}) => ({
  border: `1px solid ${COLORS.borderColor}`,
  padding: '6px 10px',
  verticalAlign: opts.valign || 'middle',
  backgroundColor: bg,
  fontWeight: bg === COLORS.mandatoryBg ? 600 : 'normal',
  fontSize: '0.85rem',
  whiteSpace: opts.nowrap ? 'nowrap' : 'normal',
  width: opts.width || 'auto',
  ...(opts.sx || {}),
});

// ── Section header row (spans full table width) ──
const SectionHeaderRow = ({ num, title }) => (
  <TableRow>
    <TableCell
      colSpan={6}
      sx={{
        backgroundColor: COLORS.headerBg,
        color: COLORS.headerText,
        fontWeight: 700,
        fontSize: '0.95rem',
        border: `1px solid ${COLORS.borderColor}`,
        padding: '10px 14px',
      }}
    >
      {num} {title}
    </TableCell>
  </TableRow>
);

// ── Inline checkbox group ──
const InlineCheckboxGroup = ({ options, value = [], onChange, error }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
    {options.map((opt) => (
      <FormControlLabel
        key={opt}
        sx={{ mr: 2, '& .MuiTypography-root': { fontSize: '0.85rem' } }}
        control={
          <Checkbox
            size="small"
            checked={value.includes(opt)}
            onChange={(e) =>
              onChange(e.target.checked ? [...value, opt] : value.filter((v) => v !== opt))
            }
          />
        }
        label={opt}
      />
    ))}
    {error && <Typography variant="caption" color="error">필수 항목</Typography>}
  </Box>
);

// ── Inline radio group ──
const InlineRadioGroup = ({ options, value, onChange, error }) => (
  <Box>
    <RadioGroup row value={value || ''} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <FormControlLabel
          key={opt}
          value={opt}
          sx={{ mr: 2, '& .MuiTypography-root': { fontSize: '0.85rem' } }}
          control={<Radio size="small" />}
          label={opt}
        />
      ))}
    </RadioGroup>
    {error && <Typography variant="caption" color="error">필수 항목</Typography>}
  </Box>
);

// Label cell (header cell for field name) — mandatory fields show * asterisk
const LabelCell = ({ children, mandatory, colSpan, width, rowSpan }) => (
  <TableCell
    colSpan={colSpan || 1}
    rowSpan={rowSpan || 1}
    sx={cellSx(mandatory ? COLORS.mandatoryBg : COLORS.optionalBg, { width: width || '140px' })}
  >
    {children}{mandatory && <span style={{ color: '#C62828', marginLeft: 2 }}> *</span>}
  </TableCell>
);

// Input cell (white background for user input)
const InputCell = ({ children, colSpan, sx: extraSx }) => (
  <TableCell
    colSpan={colSpan || 1}
    sx={cellSx(COLORS.inputBg, { sx: extraSx })}
  >
    {children}
  </TableCell>
);

// ── Default form shape ──
const EMPTY_FORM = {
  // meta
  consultationDate: '', consultantMeta: '', consultationTime: '',
  // ① 기본 정보
  name: '', birthYear: '', residence: '', gender: '',
  company: '', lastRank: '', tenureYears: '', tenureMonths: '',
  education: '', retirementType: [],
  // ② 퇴직 상황
  retirementDate: '', currentStatus: '', psychologicalState: [], currentSituation: '',
  // ③ 경력
  mainDuties: '', longestRole: '', strengths: ['', '', ''],
  managementExp: '', managementSize: '', certifications: '', digitalLevel: '',
  // ④ 진로
  desiredCareer: [], desiredField: '', desiredWorkType: [],
  desiredRegion: '', desiredTiming: '',
  // ⑤ 경제적
  desiredIncome: '', minimumIncome: '', workHours: '',
  travelAvailability: '', travelRestrictionReason: '',
  // ⑥ 준비도
  resumeStatus: [], difficulties: [], motivationLevel: '',
  familySupport: '', healthStatus: '',
  // ⑦ 기대사항
  expectations: [], preferredMethod: [], additionalRequests: '',
  // ⑧ 상담사
  consultantDiagnosisLevel: '', consultantRisks: '',
  recommendedTracks: {}, nextGoals: '',
  nextConsultationDate: '', consultantSignature: '',
};

// Mandatory fields in display order (top → bottom) with Korean labels
const MANDATORY_FIELDS_ORDERED = [
  { key: 'name', type: 'string', label: '성명' },
  { key: 'birthYear', type: 'string', label: '출생년도' },
  { key: 'residence', type: 'string', label: '거주지' },
  { key: 'gender', type: 'string', label: '성별' },
  { key: 'lastRank', type: 'string', label: '최종 직위' },
  { key: 'tenureYears', type: 'string', label: '재직기간 (년)' },
  { key: 'tenureMonths', type: 'string', label: '재직기간 (개월)' },
  { key: 'education', type: 'string', label: '최종 학력' },
  { key: 'currentStatus', type: 'string', label: '현재 상태' },
  { key: 'psychologicalState', type: 'array', label: '심리적 상태' },
  { key: 'currentSituation', type: 'string', label: '현재 상황 설명' },
  { key: 'mainDuties', type: 'string', label: '주요 업무 내용' },
  { key: 'desiredCareer', type: 'array', label: '희망 진로' },
  { key: 'desiredWorkType', type: 'array', label: '희망 근무형태' },
  { key: 'desiredRegion', type: 'string', label: '희망 근무 지역' },
  { key: 'desiredTiming', type: 'string', label: '취업 희망 시기' },
  { key: 'desiredIncome', type: 'string', label: '희망 소득' },
  { key: 'minimumIncome', type: 'string', label: '최소 희망 소득' },
  { key: 'expectations', type: 'array', label: '기대사항' },
  { key: 'preferredMethod', type: 'array', label: '선호 상담 방법' },
  { key: 'additionalRequests', type: 'string', label: '추가 요청사항' },
];

// Legacy map for field error checks — used by hasErr()
const MANDATORY_FIELDS = Object.fromEntries(MANDATORY_FIELDS_ORDERED.map((f) => [f.key, f.type])); // eslint-disable-line no-unused-vars

// Auto-format helpers
const autoFormatDate = (raw) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
};

const autoFormatTime = (raw) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  if (digits.length <= 6) return `${digits.slice(0, 2)}:${digits.slice(2, 4)} - ${digits.slice(4)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)} - ${digits.slice(4, 6)}:${digits.slice(6, 8)}`;
};

/**
 * IntakeForm — Full-width docx-style intake form.
 *
 * Props:
 *   userId    – the user this form belongs to
 *   mode      – "consultant" to show section 8
 *   embedded  – if true, renders without page chrome
 *   onClose   – callback after save (optional)
 */
const IntakeForm = ({ userId, mode, embedded = false, onClose }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const isConsultant = mode === 'consultant';

  // Load existing form data
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!userId) { setLoading(false); return; }
      try {
        const existing = await getIntakeForm(userId);
        if (!cancelled && existing) {
          setForm((prev) => ({ ...prev, ...existing }));
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    setErrors((prev) => {
      if (prev[field]) { const n = { ...prev }; delete n[field]; return n; }
      return prev;
    });
  }, []);

  const updateStrength = useCallback((idx, value) => {
    setForm((prev) => {
      const arr = [...(prev.strengths || ['', '', ''])];
      arr[idx] = value;
      return { ...prev, strengths: arr };
    });
  }, []);

  // Update recommended track rank
  const updateTrackRank = useCallback((track, checked, rank) => {
    setForm((prev) => {
      const tracks = { ...(prev.recommendedTracks || {}) };
      if (checked) {
        tracks[track] = rank || '';
      } else {
        delete tracks[track];
      }
      return { ...prev, recommendedTracks: tracks };
    });
  }, []);

  const [validationMsg, setValidationMsg] = useState('');

  const validate = () => {
    const errs = {};
    let firstMissing = null;
    for (const { key, type, label } of MANDATORY_FIELDS_ORDERED) {
      const val = form[key];
      const isEmpty = type === 'string' ? (!val || !val.trim()) : (!val || !val.length);
      if (isEmpty) {
        errs[key] = true;
        if (!firstMissing) firstMissing = label;
      }
    }
    setErrors(errs);
    if (firstMissing) {
      setValidationMsg(`"${firstMissing}" 항목을 입력해 주세요.`);
      setTimeout(() => setValidationMsg(''), 5000);
    }
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await saveIntakeForm(userId, form);
      setSaved(true);
      setValidationMsg('');
      setTimeout(() => setSaved(false), 3000);
      if (onClose) onClose();
    } catch { /* ignore */ }
  };

  const hasErr = (field) => !!errors[field];
  const tfProps = (field, opts = {}) => ({
    fullWidth: true,
    size: 'small',
    variant: 'outlined',
    value: form[field] || '',
    onChange: (e) => update(field, e.target.value),
    error: hasErr(field),
    ...(hasErr(field) ? { helperText: '필수 항목' } : {}),
    ...opts,
  });
  // Date field with auto-format: 20260325 → 2026.03.25
  const dateTfProps = (field, opts = {}) => ({
    ...tfProps(field, opts),
    onChange: (e) => update(field, autoFormatDate(e.target.value)),
    inputProps: { maxLength: 10 },
  });
  // Time field with auto-format: 10001300 → 10:00 - 13:00
  const timeTfProps = (field, opts = {}) => ({
    ...tfProps(field, opts),
    onChange: (e) => update(field, autoFormatTime(e.target.value)),
    inputProps: { maxLength: 13 },
  });

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>로딩 중...</Typography></Box>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto', p: embedded ? 2 : 3 }}>
      {saved && <Alert severity="success" sx={{ mb: 2 }}>저장되었습니다.</Alert>}
      {validationMsg && (
        <Alert severity="error" sx={{ mb: 2, position: 'sticky', top: 0, zIndex: 10 }}>{validationMsg}</Alert>
      )}

      {/* ═══ Top banner ═══ */}
      <Paper elevation={0} sx={{ border: `2px solid ${COLORS.headerBg}`, borderRadius: 0, overflow: 'hidden', mb: 0 }}>
        <Box sx={{ bgcolor: COLORS.topBannerBg, color: '#fff', textAlign: 'center', py: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1 }}>
            우리은행 퇴직자 전직지원 프로그램
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
            퇴직자 초기상담 인테이크 양식
          </Typography>
        </Box>

        {/* Meta row: 상담일자, 상담사, 상담시간 */}
        <Table sx={{ tableLayout: 'auto', borderCollapse: 'collapse' }}>
          <TableBody>
            <TableRow>
              <TableCell sx={cellSx(COLORS.metaRowBg, { width: '100px', nowrap: true })}>상담일자</TableCell>
              <TableCell sx={cellSx(COLORS.inputBg)}>
                <TextField {...dateTfProps('consultationDate', { placeholder: '예: 20260326' })} />
              </TableCell>
              <TableCell sx={cellSx(COLORS.metaRowBg, { width: '80px', nowrap: true })}>상담사</TableCell>
              <TableCell sx={cellSx(COLORS.inputBg)}>
                <TextField {...tfProps('consultantMeta')} />
              </TableCell>
              <TableCell sx={cellSx(COLORS.metaRowBg, { width: '100px', nowrap: true })}>상담시간</TableCell>
              <TableCell sx={cellSx(COLORS.inputBg)}>
                <TextField {...timeTfProps('consultationTime', { placeholder: '예: 10001300' })} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* ═══ Main form table ═══ */}
      <Paper elevation={0} sx={{ border: `2px solid ${COLORS.headerBg}`, borderTop: 'none', borderRadius: 0, overflow: 'hidden' }}>
        <Table sx={{ tableLayout: 'fixed', borderCollapse: 'collapse', width: '100%' }}>
          <TableBody>

            {/* ═══════════════════════════════════════════════════════════
                ① 기본 정보 (Profile Intake)
            ═══════════════════════════════════════════════════════════ */}
            <SectionHeaderRow num="①" title="기본 정보 (Profile Intake)" />

            {/* 성명 | 출생연도 */}
            <TableRow>
              <LabelCell mandatory width="14%">성명 (또는 ID)</LabelCell>
              <InputCell colSpan={2}>
                <TextField {...tfProps('name')} />
              </InputCell>
              <LabelCell mandatory width="14%">출생연도</LabelCell>
              <InputCell colSpan={2}>
                <TextField {...tfProps('birthYear', { placeholder: '예: 1970' })} />
              </InputCell>
            </TableRow>

            {/* 거주 지역 | 성별 */}
            <TableRow>
              <LabelCell mandatory>거주 지역</LabelCell>
              <InputCell colSpan={2}>
                <TextField {...tfProps('residence', { placeholder: '예: 서울시 강남구' })} />
              </InputCell>
              <LabelCell mandatory>성별 (선택)</LabelCell>
              <InputCell colSpan={2}>
                <InlineRadioGroup
                  options={['남성', '여성', '미기재']}
                  value={form.gender}
                  onChange={(v) => update('gender', v)}
                  error={hasErr('gender')}
                />
              </InputCell>
            </TableRow>

            {/* 퇴직 회사 / 업종 */}
            <TableRow>
              <LabelCell>퇴직 회사 / 업종</LabelCell>
              <InputCell colSpan={5}>
                <TextField {...tfProps('company')} />
              </InputCell>
            </TableRow>

            {/* 최종 직급 | 근속기간 | 최종학력 */}
            <TableRow>
              <LabelCell mandatory>최종 직급</LabelCell>
              <InputCell>
                <TextField {...tfProps('lastRank')} />
              </InputCell>
              <LabelCell mandatory>근속기간</LabelCell>
              <InputCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TextField {...tfProps('tenureYears', { sx: { width: '60px' } })} />
                  <Typography variant="body2">년</Typography>
                  <TextField {...tfProps('tenureMonths', { sx: { width: '60px' } })} />
                  <Typography variant="body2">개월</Typography>
                </Box>
              </InputCell>
              <LabelCell mandatory>최종학력</LabelCell>
              <InputCell>
                <TextField {...tfProps('education')} />
              </InputCell>
            </TableRow>

            {/* 퇴직 유형 */}
            <TableRow>
              <LabelCell>퇴직 유형</LabelCell>
              <InputCell colSpan={5}>
                <InlineCheckboxGroup
                  options={['희망퇴직', '정년퇴직', '권고사직', '기타']}
                  value={form.retirementType || []}
                  onChange={(v) => update('retirementType', v)}
                />
              </InputCell>
            </TableRow>

            {/* ═══════════════════════════════════════════════════════════
                ② 퇴직 상황 및 현재 상태 진단
            ═══════════════════════════════════════════════════════════ */}
            <SectionHeaderRow num="②" title="퇴직 상황 및 현재 상태 진단" />

            <TableRow>
              <LabelCell>퇴직 시점</LabelCell>
              <InputCell colSpan={5}>
                <TextField {...dateTfProps('retirementDate', { placeholder: '예: 202512' })} />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell mandatory>현재 상태</LabelCell>
              <InputCell colSpan={5}>
                <InlineRadioGroup
                  options={['재취업 준비', '휴식', '창업 준비', '진로 고민 단계']}
                  value={form.currentStatus}
                  onChange={(v) => update('currentStatus', v)}
                  error={hasErr('currentStatus')}
                />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell mandatory>퇴직에 대한 현재 심리 상태 (복수 선택 가능)</LabelCell>
              <InputCell colSpan={5}>
                <InlineCheckboxGroup
                  options={['안정감', '불안', '기대감', '방향성 혼란', '경제적 부담', '기타']}
                  value={form.psychologicalState}
                  onChange={(v) => update('psychologicalState', v)}
                  error={hasErr('psychologicalState')}
                />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell mandatory>퇴직 후 현재까지의 상황 (자유 기술)</LabelCell>
              <InputCell colSpan={5}>
                <TextField {...tfProps('currentSituation', { multiline: true, rows: 3 })} />
              </InputCell>
            </TableRow>

            {/* ═══════════════════════════════════════════════════════════
                ③ 경력 및 역량 파악 (Career Background)
            ═══════════════════════════════════════════════════════════ */}
            <SectionHeaderRow num="③" title="경력 및 역량 파악 (Career Background)" />

            <TableRow>
              <LabelCell mandatory>주요 수행 업무 (자유 기술)</LabelCell>
              <InputCell colSpan={5}>
                <TextField {...tfProps('mainDuties', { multiline: true, rows: 3 })} />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell>가장 오래 수행한 직무</LabelCell>
              <InputCell colSpan={5}>
                <TextField {...tfProps('longestRole')} />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell>본인이 강점이라 생각하는 역량 (최대 3가지)</LabelCell>
              <InputCell colSpan={5}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[0, 1, 2].map((i) => (
                    <TextField
                      key={i}
                      fullWidth size="small" variant="outlined"
                      label={`${i + 1}번`}
                      value={(form.strengths || [])[i] || ''}
                      onChange={(e) => updateStrength(i, e.target.value)}
                    />
                  ))}
                </Box>
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell>관리자/팀장급 이상 경험 여부</LabelCell>
              <InputCell colSpan={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InlineRadioGroup
                    options={['있음', '없음']}
                    value={form.managementExp}
                    onChange={(v) => update('managementExp', v)}
                  />
                  {form.managementExp === '있음' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">max</Typography>
                      <TextField
                        size="small" variant="outlined" sx={{ width: '80px' }}
                        value={form.managementSize || ''}
                        onChange={(e) => update('managementSize', e.target.value)}
                      />
                      <Typography variant="body2">인원</Typography>
                    </Box>
                  )}
                </Box>
              </InputCell>
              <LabelCell>보유 자격증 (주요 2~3개)</LabelCell>
              <InputCell colSpan={2}>
                <TextField {...tfProps('certifications')} />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell>디지털 활용 수준</LabelCell>
              <InputCell colSpan={5}>
                <InlineRadioGroup
                  options={[
                    '낮음(기본 PC 수준)',
                    '보통(엑셀·인터넷 활용)',
                    '높음(디지털 툴·SNS 활용)',
                    '전문(데이터·IT 계열)',
                  ]}
                  value={form.digitalLevel}
                  onChange={(v) => update('digitalLevel', v)}
                />
              </InputCell>
            </TableRow>

            {/* ═══════════════════════════════════════════════════════════
                ④ 향후 진로 방향 탐색 (Career Direction)
            ═══════════════════════════════════════════════════════════ */}
            <SectionHeaderRow num="④" title="향후 진로 방향 탐색 (Career Direction)" />

            <TableRow>
              <LabelCell mandatory>희망 진로 (복수 선택 가능)</LabelCell>
              <InputCell colSpan={5}>
                <InlineCheckboxGroup
                  options={[
                    '재취업(정규·계약직)', '파트타임 근무', '창업·소자본 창업',
                    '프리랜서·컨설팅', '사회공헌·강의·코칭', '아직 미정',
                  ]}
                  value={form.desiredCareer}
                  onChange={(v) => update('desiredCareer', v)}
                  error={hasErr('desiredCareer')}
                />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell>희망 직무 / 분야</LabelCell>
              <InputCell colSpan={5}>
                <TextField {...tfProps('desiredField')} />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell mandatory>희망 근무 형태</LabelCell>
              <InputCell colSpan={5}>
                <InlineCheckboxGroup
                  options={['정규직', '계약직', '시간제(파트타임)', '프로젝트형(단기)']}
                  value={form.desiredWorkType || []}
                  onChange={(v) => update('desiredWorkType', v)}
                  error={hasErr('desiredWorkType')}
                />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell mandatory>희망 근무 지역</LabelCell>
              <InputCell colSpan={2}>
                <TextField {...tfProps('desiredRegion')} />
              </InputCell>
              <LabelCell mandatory>재취업 희망 시기</LabelCell>
              <InputCell colSpan={2}>
                <InlineRadioGroup
                  options={['즉시', '3개월 내', '6개월 내', '미정']}
                  value={form.desiredTiming}
                  onChange={(v) => update('desiredTiming', v)}
                  error={hasErr('desiredTiming')}
                />
              </InputCell>
            </TableRow>

            {/* ═══════════════════════════════════════════════════════════
                ⑤ 경제적 기대 수준
            ═══════════════════════════════════════════════════════════ */}
            <SectionHeaderRow num="⑤" title="경제적 기대 수준" />

            <TableRow>
              <LabelCell mandatory>희망 월 소득 수준</LabelCell>
              <InputCell colSpan={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2">월</Typography>
                  <TextField {...tfProps('desiredIncome', { sx: { width: '100px' } })} />
                  <Typography variant="body2">만원 이상</Typography>
                </Box>
              </InputCell>
              <LabelCell mandatory>최소 수용 가능 소득</LabelCell>
              <InputCell colSpan={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2">월</Typography>
                  <TextField {...tfProps('minimumIncome', { sx: { width: '100px' } })} />
                  <Typography variant="body2">만원 이상</Typography>
                </Box>
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell>근로시간 수용 범위</LabelCell>
              <InputCell colSpan={2}>
                <InlineRadioGroup
                  options={['풀타임(주 40시간)', '파트타임', '유연근무']}
                  value={form.workHours}
                  onChange={(v) => update('workHours', v)}
                />
              </InputCell>
              <LabelCell>출장/이동 가능 여부</LabelCell>
              <InputCell colSpan={2}>
                <InlineRadioGroup
                  options={['가능', '제한적', '불가']}
                  value={form.travelAvailability}
                  onChange={(v) => update('travelAvailability', v)}
                />
                {(form.travelAvailability === '불가' || form.travelAvailability === '제한적') && (
                  <TextField
                    size="small" variant="outlined" fullWidth sx={{ mt: 1 }}
                    placeholder="사유"
                    value={form.travelRestrictionReason || ''}
                    onChange={(e) => update('travelRestrictionReason', e.target.value)}
                  />
                )}
              </InputCell>
            </TableRow>

            {/* ═══════════════════════════════════════════════════════════
                ⑥ 준비도 및 장애요인 진단
            ═══════════════════════════════════════════════════════════ */}
            <SectionHeaderRow num="⑥" title="준비도 및 장애요인 진단" />

            <TableRow>
              <LabelCell>구직 준비 수준</LabelCell>
              <InputCell colSpan={5}>
                <InlineCheckboxGroup
                  options={[
                    '이력서 있음(최신)', '이력서 있음(업데이트 필요)',
                    '이력서 없음(작성 지원 필요)', '포트폴리오 보유',
                  ]}
                  value={form.resumeStatus || []}
                  onChange={(v) => update('resumeStatus', v)}
                />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell>현재 느끼는 어려움 요소 (복수 선택)</LabelCell>
              <InputCell colSpan={5}>
                <InlineCheckboxGroup
                  options={[
                    '정보 부족', '자신감 부족', '연령 장벽 우려', '네트워크 부족',
                    '디지털 역량 부족', '건강 문제', '가족 상황', '기타',
                  ]}
                  value={form.difficulties}
                  onChange={(v) => update('difficulties', v)}
                />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell>구직 의욕 수준 (자기 평가)</LabelCell>
              <InputCell colSpan={5}>
                <InlineRadioGroup
                  options={['1 매우 낮음', '2 낮음', '3 보통', '4 높음', '5 매우 높음']}
                  value={form.motivationLevel}
                  onChange={(v) => update('motivationLevel', v)}
                />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell>가족의 지지 여부</LabelCell>
              <InputCell colSpan={2}>
                <InlineRadioGroup
                  options={['적극 지지', '보통', '반대 또는 우려']}
                  value={form.familySupport}
                  onChange={(v) => update('familySupport', v)}
                />
              </InputCell>
              <LabelCell>건강 상태</LabelCell>
              <InputCell colSpan={2}>
                <InlineRadioGroup
                  options={['양호', '관리 중', '제약 있음']}
                  value={form.healthStatus}
                  onChange={(v) => update('healthStatus', v)}
                />
              </InputCell>
            </TableRow>

            {/* ═══════════════════════════════════════════════════════════
                ⑦ 프로그램 기대사항 (Needs Assessment)
            ═══════════════════════════════════════════════════════════ */}
            <SectionHeaderRow num="⑦" title="프로그램 기대사항 (Needs Assessment)" />

            <TableRow>
              <LabelCell mandatory>이번 프로그램에서 가장 기대하는 것 (복수 선택)</LabelCell>
              <InputCell colSpan={5}>
                <InlineCheckboxGroup
                  options={['취업 연계', '진로 설계·탐색', '심리 안정·회복', '교육·재교육', '네트워킹', '창업 지원']}
                  value={form.expectations}
                  onChange={(v) => update('expectations', v)}
                  error={hasErr('expectations')}
                />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell mandatory>선호 지원 방식 (복수 선택)</LabelCell>
              <InputCell colSpan={5}>
                <InlineCheckboxGroup
                  options={['1:1 개인 상담', '그룹 교육(소규모)', '온라인 진행', '오프라인 대면', '혼합형(온·오프라인)']}
                  value={form.preferredMethod}
                  onChange={(v) => update('preferredMethod', v)}
                  error={hasErr('preferredMethod')}
                />
              </InputCell>
            </TableRow>

            <TableRow>
              <LabelCell mandatory>프로그램에 바라는 점 / 기타 요청사항 (자유 기술)</LabelCell>
              <InputCell colSpan={5}>
                <TextField {...tfProps('additionalRequests', { multiline: true, rows: 3 })} />
              </InputCell>
            </TableRow>

            {/* ═══════════════════════════════════════════════════════════
                ⑧ 상담사 기록 영역 [상담사 전용 — 참가자 비공개]
                Only visible when mode="consultant"
            ═══════════════════════════════════════════════════════════ */}
            {isConsultant && (
              <>
                <SectionHeaderRow num="⑧" title="상담사 기록 영역 [상담사 전용 — 참가자 비공개]" />

                {/* Notice */}
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={cellSx('#FFF9E6', { sx: { color: '#B45309', fontWeight: 600, fontSize: '0.85rem' } })}
                  >
                    ※ 이 영역은 상담사만 기록합니다. 참가자에게 공개하지 않습니다.
                  </TableCell>
                </TableRow>

                {/* 초기 진단 레벨 */}
                <TableRow>
                  <LabelCell>초기 진단 레벨</LabelCell>
                  <InputCell colSpan={5}>
                    <RadioGroup
                      row
                      value={form.consultantDiagnosisLevel || ''}
                      onChange={(e) => update('consultantDiagnosisLevel', e.target.value)}
                    >
                      {[
                        { val: 'A등급', label: 'A등급(즉시 취업 가능)', color: '#1565C0' },
                        { val: 'B등급', label: 'B등급(재정비 필요)', color: '#2E7D32' },
                        { val: 'C등급', label: 'C등급(진로 탐색 필요)', color: '#E65100' },
                        { val: 'D등급', label: 'D등급(심리 지원 우선)', color: '#C62828' },
                      ].map((g) => (
                        <FormControlLabel
                          key={g.val}
                          value={g.val}
                          control={<Radio size="small" sx={{ color: g.color, '&.Mui-checked': { color: g.color } }} />}
                          label={<Typography variant="body2" sx={{ color: g.color, fontWeight: 600 }}>{g.label}</Typography>}
                          sx={{ mr: 3 }}
                        />
                      ))}
                    </RadioGroup>
                  </InputCell>
                </TableRow>

                {/* 주요 리스크 및 특이사항 */}
                <TableRow>
                  <LabelCell>주요 리스크 및 특이사항</LabelCell>
                  <InputCell colSpan={5}>
                    <TextField {...tfProps('consultantRisks', { multiline: true, rows: 2 })} />
                  </InputCell>
                </TableRow>

                {/* 추천 트랙 */}
                <TableRow>
                  <LabelCell>추천 트랙 (순위별 기재)</LabelCell>
                  <InputCell colSpan={5}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['재취업 집중', '창업·프리랜서', '교육·재훈련', '심리 안정 우선', '생애설계'].map((track) => {
                        const tracks = form.recommendedTracks || {};
                        const checked = track in tracks;
                        return (
                          <Box key={track} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 2 }}>
                            <FormControlLabel
                              sx={{ '& .MuiTypography-root': { fontSize: '0.85rem' } }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={checked}
                                  onChange={(e) => updateTrackRank(track, e.target.checked, '')}
                                />
                              }
                              label={track}
                            />
                            {checked && (
                              <TextField
                                size="small" variant="outlined"
                                placeholder="순위"
                                sx={{ width: '55px' }}
                                value={tracks[track] || ''}
                                onChange={(e) => updateTrackRank(track, true, e.target.value)}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </InputCell>
                </TableRow>

                {/* 다음 상담 목표 / 액션 아이템 */}
                <TableRow>
                  <LabelCell>다음 상담 목표 / 액션 아이템</LabelCell>
                  <InputCell colSpan={5}>
                    <TextField {...tfProps('nextGoals', { multiline: true, rows: 2 })} />
                  </InputCell>
                </TableRow>

                {/* 다음 상담 예정일 | 상담사 서명 */}
                <TableRow>
                  <LabelCell>다음 상담 예정일</LabelCell>
                  <InputCell colSpan={2}>
                    <TextField {...dateTfProps('nextConsultationDate', { placeholder: '예: 20260402' })} />
                  </InputCell>
                  <LabelCell>상담사 서명</LabelCell>
                  <InputCell colSpan={2}>
                    <TextField {...tfProps('consultantSignature')} />
                  </InputCell>
                </TableRow>
              </>
            )}

          </TableBody>
        </Table>
      </Paper>

      {/* ═══ Save button ═══ */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ px: 8, py: 1.5, bgcolor: COLORS.headerBg, '&:hover': { bgcolor: '#184A7A' } }}
        >
          저장하기
        </Button>
      </Box>

      {/* ═══ Privacy footer ═══ */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', textAlign: 'center', mt: 2, mb: 1, fontSize: '0.75rem', lineHeight: 1.6 }}
      >
        본 양식에 기재된 정보는 전직지원 프로그램 운영 목적으로만 활용되며, 개인정보보호법에 따라 엄격히 관리됩니다.<br />
        수집된 정보는 서비스 종료 후 5년간 보관 후 파기됩니다. | 퍼솔코리아 유한회사
      </Typography>
    </Box>
  );
};

export default IntakeForm;
