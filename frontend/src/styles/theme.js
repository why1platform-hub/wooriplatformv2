import { createTheme } from '@mui/material/styles';

const wooriColors = {
  primary: '#0047BA',
  background: '#FFFFFF',
  sectionBg: '#FAFBFC',
  text: '#1a1a1a',
  textSecondary: '#6B7280',
  border: '#EAEDF0',
  success: '#28A745',
  warning: '#F59E0B',
  error: '#DC3545',
  info: '#17A2B8',
};

export const categoryColors = {
  '금융컨설팅': '#0047BA',
  '부동산': '#059669',
  '창업': '#DC2626',
  '사회공헌': '#7C3AED',
  '건강': '#059669',
  '디지털': '#2563EB',
  '여가': '#EA580C',
  '재무': '#0891B2',
};

export const statusColors = {
  '모집중': { bg: '#DCFCE7', text: '#166534' },
  '접수중': { bg: '#DBEAFE', text: '#1E40AF' },
  '마감예정': { bg: '#FEF3C7', text: '#92400E' },
  '종료': { bg: '#F3F4F6', text: '#6B7280' },
  '진행중': { bg: '#DBEAFE', text: '#1E40AF' },
  '승인대기': { bg: '#FEF3C7', text: '#92400E' },
  '승인완료': { bg: '#DCFCE7', text: '#166534' },
  '완료': { bg: '#F3F4F6', text: '#6B7280' },
  '취소': { bg: '#FEE2E2', text: '#991B1B' },
};

const theme = createTheme({
  palette: {
    primary: {
      main: wooriColors.primary,
      light: '#3366CC',
      dark: '#003399',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6B7280',
      light: '#9CA3AF',
      dark: '#4B5563',
    },
    background: {
      default: wooriColors.background,
      paper: wooriColors.background,
    },
    text: {
      primary: wooriColors.text,
      secondary: wooriColors.textSecondary,
    },
    divider: wooriColors.border,
    success: { main: wooriColors.success },
    warning: { main: wooriColors.warning },
    error: { main: wooriColors.error },
    info: { main: wooriColors.info },
  },
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.4 },
    h2: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.4 },
    h3: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4 },
    h4: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '0.95rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        outlined: {
          borderColor: wooriColors.border,
          '&:hover': {
            borderColor: wooriColors.primary,
            backgroundColor: 'rgba(0, 71, 186, 0.04)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: `1px solid ${wooriColors.border}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
        elevation0: { boxShadow: 'none' },
        elevation1: { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: wooriColors.sectionBg,
          '& .MuiTableCell-head': { fontWeight: 600, color: wooriColors.text },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${wooriColors.border}`, padding: '12px 16px' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, minWidth: 100 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 1px 0 rgba(0, 0, 0, 0.06)' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: 'none' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
  },
});

export default theme;
export { wooriColors };
