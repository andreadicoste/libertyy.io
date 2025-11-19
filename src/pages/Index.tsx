import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (loading) return;
    if (profile) {
      navigate('/contatti');
    } else {
      navigate('/login');
    }
  }, [profile, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-muted-foreground">Caricamento...</div>
    </div>
  );
};

export default Index;
