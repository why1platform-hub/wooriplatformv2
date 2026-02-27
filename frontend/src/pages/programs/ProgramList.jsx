import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Skeleton,
  Grid,
} from '@mui/material';
import {
  Info as InfoIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { programsAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const ProgramList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await programsAPI.getAll();
        setPrograms(response.data.programs || []);
      } catch (error) {
        console.error('Failed to fetch programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Mock data
  const mockPrograms = [
    { id: 1, title: '은퇴 후 자산 관리 심화 과정', category: '금융컨설팅', period: '2026.01.05 - 2026.01.25', status: '모집중' },
    { id: 2, title: '도심형 소규모 부동산 투자 전략', category: '부동산', period: '2026.01.10 - 2026.01.31', status: '모집중' },
    { id: 3, title: '제2의 인생, 창업 아이디어 워크숍', category: '창업', period: '2026.01.01 - 2026.01.20', status: '마감예정' },
    { id: 4, title: '지역 사회 봉사 활동 리더 양성', category: '사회공헌', period: '2026.01.15 - 2026.02.15', status: '모집중' },
    { id: 5, title: '디지털 금융 활용 교육 (시니어)', category: '금융컨설팅', period: '2025.12.25 - 2026.01.15', status: '종료' },
    { id: 6, title: '은퇴 전문가 매칭 및 컨설팅', category: '금융컨설팅', period: '2026.01.08 - 2026.01.28', status: '모집중' },
  ];

  const displayPrograms = programs.length > 0 ? programs : mockPrograms;

  const filteredPrograms = displayPrograms.filter((program) => {
    if (tab === 0) return true;
    if (tab === 1) return program.status === '모집중' || program.status === '진행중';
    if (tab === 2) return program.status === '마감예정';
    if (tab === 3) return program.status === '종료';
    return true;
  });

  const handleApply = (programId, e) => {
    e.stopPropagation();
    navigate(`/programs/${programId}/apply`);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          {t('programs.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('programs.subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={9}>
          <Card>
            <CardContent>
              {/* Filter Tabs */}
              <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                sx={{ mb: 3, borderBottom: '1px solid #E5E5E5' }}
              >
                <Tab label={t('common.all')} />
                <Tab label="진행중" />
                <Tab label="마감예정" />
                <Tab label="종료" />
              </Tabs>

              {/* Programs Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('programs.programName')}</TableCell>
                      <TableCell align="center">{t('programs.category')}</TableCell>
                      <TableCell align="center">{t('programs.recruitmentPeriod')}</TableCell>
                      <TableCell align="center">{t('programs.status')}</TableCell>
                      <TableCell align="center">{t('programs.action')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      [...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredPrograms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            프로그램이 없습니다
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPrograms.map((program) => (
                        <TableRow
                          key={program.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/programs/${program.id}`)}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {program.title || program.title_ko}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <CategoryBadge category={program.category} />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {program.period || `${program.recruitment_start} - ${program.recruitment_end}`}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <StatusBadge status={program.status} />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={program.status === '종료'}
                              onClick={(e) => handleApply(program.id, e)}
                            >
                              {program.status === '종료' ? '마감' : t('programs.applyNow')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={3}>
          {/* Application Guide */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('programs.applicationGuide')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#0047BA', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</Box>
                  <Typography variant="body2">{t('programs.guideStep1')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#0047BA', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</Box>
                  <Typography variant="body2">{t('programs.guideStep2')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#0047BA', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</Box>
                  <Typography variant="body2">{t('programs.guideStep3')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Inquiry Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<HelpIcon />}
            onClick={() => navigate('/support/inquiry')}
          >
            {t('programs.inquire')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgramList;
