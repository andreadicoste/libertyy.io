'use client';

import { useCallback, useEffect, useState } from 'react';
import { Company, Profile } from '@/types/database';

export type ProfileWithEmail = Profile & { email: string | null };

type ProfileResponse = {
  profile: ProfileWithEmail | null;
  company: Company | null;
  error?: string;
};

export function useProfile() {
  const [profile, setProfile] = useState<ProfileWithEmail | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile', { cache: 'no-store' });
      if (response.status === 401) {
        setProfile(null);
        setCompany(null);
        return;
      }

      const payload = (await response.json()) as ProfileResponse;
      if (payload.error) {
        throw new Error(payload.error);
      }

      setProfile(payload.profile);
      setCompany(payload.company);
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
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = typeof data.error === 'string' ? data.error : 'Impossibile aggiornare il profilo';
    throw new Error(message);
  }
}
