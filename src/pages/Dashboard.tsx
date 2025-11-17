import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types/database';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        toast.error('Errore nel caricamento del profilo');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Caricamento dashboard...</div>
      </div>
    );
  }

  if (!profile?.company_id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Nessuna azienda associata</h2>
          <p className="text-muted-foreground">Contatta l'amministratore del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-8">
          <KanbanBoard companyId={profile.company_id} />
        </div>
      </main>
    </div>
  );
}
