import { supabaseBrowser } from 'lib/supabase-browser';

const BUCKET = 'blogs';

export async function uploadCoverImage(file: File, path: string) {
  const supabase = supabaseBrowser();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
