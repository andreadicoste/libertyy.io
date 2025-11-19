import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthError } from '@supabase/supabase-js';
import { Company, Profile } from '@/types/database';

type NullableCompany = Company | null;

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<NullableCompany>(null);
  const [loading, setLoading] = useState(true);

  const ensureCompanyForProfile = useCallback(async (currentProfile: Profile) => {
    const defaultName = currentProfile.full_name?.trim()
      ? `${currentProfile.full_name.trim()} - Azienda`
      : 'Nuova azienda';

    const { data: insertedCompany, error: insertError } = await supabase
      .from('companies')
      .insert({ company_name: defaultName })
      .select('id, company_name')
      .single();

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ company_id: insertedCompany.id })
      .eq('id', currentProfile.id);

    if (updateError) throw updateError;

    const enrichedCompany: Company = {
      id: insertedCompany.id,
      company_name: insertedCompany.company_name,
    };

    return enrichedCompany;
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const user = session?.user;
      if (!user) {
        setProfile(null);
        setCompany(null);
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, company_id, email, full_name, avatar_url, role, created_at')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      const normalizedProfile: Profile = {
        id: profileData.id,
        company_id: profileData.company_id ?? null,
        email: profileData.email ?? user.email ?? null,
        full_name: profileData.full_name ?? null,
        avatar_url: profileData.avatar_url ?? null,
        role: profileData.role ?? null,
        created_at: profileData.created_at ?? new Date().toISOString(),
      };

      let companyRecord: NullableCompany = null;

      if (normalizedProfile.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, company_name')
          .eq('id', normalizedProfile.company_id)
          .maybeSingle();

        if (companyError && companyError.code !== 'PGRST116') {
          throw companyError;
        }

        if (companyData) {
          companyRecord = {
            id: companyData.id,
            company_name: companyData.company_name,
            created_at: companyData.created_at ?? null,
          };
        }
      }

      if (!companyRecord) {
        companyRecord = await ensureCompanyForProfile(normalizedProfile);
        normalizedProfile.company_id = companyRecord.id;
      }

      setProfile(normalizedProfile);
      setCompany(companyRecord);
    } catch (error) {
      if (error instanceof AuthError && error.message.includes('Auth session missing')) {
        setProfile(null);
        setCompany(null);
      } else {
        console.error(error);
        setProfile(null);
        setCompany(null);
      }
    } finally {
      setLoading(false);
    }
  }, [ensureCompanyForProfile]);

  useEffect(() => {
    fetchProfile();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
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
