import { supabase } from '@/lib/supabase';

const BUCKET = 'blogs';

const buildPath = (companyId: string, fileName: string) => {
  const cleanName = fileName.replace(/\s+/g, '-').toLowerCase();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${companyId}/${unique}-${cleanName}`;
};

export async function uploadCoverImage(file: File, companyId: string) {
  const path = buildPath(companyId, file.name);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
