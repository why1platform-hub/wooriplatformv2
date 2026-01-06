import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { faqAPI } from '../../services/api';

const FAQ = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [expanded, setExpanded] = useState(null);

  const categories = ['전체', '회원', '프로그램', '채용', '학습', '기타'];

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      try {
        const response = await faqAPI.getAll();
        setFaqs(response.data.faqs || []);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  // Mock data
  const mockFAQs = [
    {
      id: 1,
      category: '회원',
      question: '회원가입은 어떻게 하나요?',
      answer: '우리은행 퇴직자 통합지원 플랫폼은 우리은행 퇴직자를 대상으로 합니다. 회원가입을 위해서는 퇴직자 인증이 필요하며, 인사부서에서 발급받은 인증코드를 사용하여 가입하실 수 있습니다. 가입 시 개인정보 동의와 함께 기본 정보를 입력해주시면 됩니다.',
    },
    {
      id: 2,
      category: '회원',
      question: '비밀번호를 잊어버렸어요.',
      answer: '로그인 페이지에서 "비밀번호 찾기" 버튼을 클릭하시면 가입 시 등록한 이메일로 비밀번호 재설정 링크가 발송됩니다. 이메일이 도착하지 않는 경우, 스팸함을 확인해주시거나 고객지원으로 문의해주세요.',
    },
    {
      id: 3,
      category: '프로그램',
      question: '프로그램 신청은 어떻게 하나요?',
      answer: '로그인 후 "프로그램 신청" 메뉴에서 현재 모집 중인 프로그램 목록을 확인하실 수 있습니다. 원하시는 프로그램의 상세 내용을 확인하시고 "신청하기" 버튼을 클릭하여 필요한 정보를 입력하시면 신청이 완료됩니다.',
    },
    {
      id: 4,
      category: '프로그램',
      question: '신청한 프로그램을 취소할 수 있나요?',
      answer: '프로그램 시작 7일 전까지는 "나의 활동" 메뉴에서 신청 취소가 가능합니다. 그 이후에는 담당자에게 별도로 연락하셔야 합니다. 취소 사유에 따라 추후 프로그램 신청에 제한이 있을 수 있으니 신중하게 신청해주세요.',
    },
    {
      id: 5,
      category: '채용',
      question: '채용정보는 어떻게 확인하나요?',
      answer: '로그인 후 "채용정보" 메뉴에서 현재 등록된 채용 공고를 확인하실 수 있습니다. 지역, 고용형태, 분야별로 필터링이 가능하며, 관심 있는 채용 공고는 북마크하여 관리하실 수 있습니다.',
    },
    {
      id: 6,
      category: '채용',
      question: '이력서는 어떻게 관리하나요?',
      answer: '"채용정보" 메뉴의 "이력서 관리"에서 이력서를 작성하고 관리할 수 있습니다. 여러 개의 이력서를 등록할 수 있으며, 대표 이력서를 설정하여 지원 시 자동으로 첨부되도록 할 수 있습니다.',
    },
    {
      id: 7,
      category: '학습',
      question: '온라인 강의는 어떻게 수강하나요?',
      answer: '"학습자료실" 메뉴에서 온라인 강의 목록을 확인하고 원하시는 강의를 선택하여 수강하실 수 있습니다. 강의는 언제든지 일시정지하고 이어서 시청할 수 있으며, 수강 진도율이 자동으로 저장됩니다.',
    },
    {
      id: 8,
      category: '학습',
      question: '수료증은 어떻게 발급받나요?',
      answer: '강의의 모든 차시를 완료하시면 수료증 발급 버튼이 활성화됩니다. 수료증은 PDF 형식으로 다운로드 가능하며, "나의 활동" 메뉴에서도 수료 현황을 확인하실 수 있습니다.',
    },
    {
      id: 9,
      category: '기타',
      question: '개인정보는 어떻게 수정하나요?',
      answer: '로그인 후 우측 상단의 프로필 메뉴에서 "내 정보 수정"을 클릭하시면 개인정보를 수정하실 수 있습니다. 이름, 연락처, 이메일 등 기본 정보와 관심 분야, 보유 스킬 등을 수정할 수 있습니다.',
    },
    {
      id: 10,
      category: '기타',
      question: '1:1 문의는 어떻게 하나요?',
      answer: '"고객지원" 메뉴의 "1:1 문의"에서 문의를 등록하실 수 있습니다. 문의 유형을 선택하고 내용을 작성하시면 담당자가 확인 후 답변을 드립니다. 답변은 등록된 이메일로도 발송됩니다.',
    },
  ];

  const displayFAQs = faqs.length > 0 ? faqs : mockFAQs;

  const filteredFAQs = displayFAQs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          {t('support.faq')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('support.faqDescription')}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="질문을 검색해보세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {/* Category Filters */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                onClick={() => setSelectedCategory(category)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          {/* FAQ List */}
          {loading ? (
            <Box>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : filteredFAQs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">
                검색 결과가 없습니다
              </Typography>
            </Box>
          ) : (
            filteredFAQs.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expanded === faq.id}
                onChange={handleAccordionChange(faq.id)}
                sx={{
                  mb: 1,
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  border: '1px solid #E5E5E5',
                  '&.Mui-expanded': {
                    margin: 0,
                    mb: 1,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&.Mui-expanded': {
                      minHeight: 48,
                      borderBottom: '1px solid #E5E5E5',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={faq.category}
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 60 }}
                    />
                    <Typography variant="body1" fontWeight={500}>
                      Q. {faq.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#F8F9FA' }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    A. {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FAQ;
