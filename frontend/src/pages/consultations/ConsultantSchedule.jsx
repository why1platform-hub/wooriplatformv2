import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

// ConsultantSchedule now redirects to admin/consultations
// where consultants manage their assigned bookings and users
const ConsultantSchedule = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/consultations', { replace: true });
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress />
    </Box>
  );
};

export default ConsultantSchedule;
