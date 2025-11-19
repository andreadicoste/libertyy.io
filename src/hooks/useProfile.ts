import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Company, Profile } from '@/types/database';

export type ProfileWithEmail = Profile & { email: string | null };

export function useProfile() {
  const [profile, setProfile] = useState<ProfileWithEmail | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setProfile(null);
        setCompany(null);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      setProfile({ ...(profileData as Profile), email: user.email });

      if (profileData?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .single();
        if (companyError) throw companyError;
        setCompany(companyData as Company);
      } else {
        setCompany(null);
      }
    } catch (error) {
      console.error(error);
      setProfile(null);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, company, loading, refresh: fetchProfile };
}

export async function updateProfile(payload: { full_name?: string; avatar_url?: string | null }) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Utente non autenticato');

  const updates: Record<string, string | null | undefined> = {};
  if (payload.full_name !== undefined) updates.full_name = payload.full_name;
  if (payload.avatar_url !== undefined) updates.avatar_url = payload.avatar_url;

  const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', user.id);
  if (updateError) throw updateError;
}
