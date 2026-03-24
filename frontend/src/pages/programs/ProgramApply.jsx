import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Program application is now handled directly on the ProgramDetail page (instant apply).
// This component redirects to the detail page for backwards compatibility.
const ProgramApply = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/programs/${id}`, { replace: true });
  }, [id, navigate]);

  return null;
};

export default ProgramApply;
