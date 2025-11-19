import { supabase } from '@/lib/supabase';

export async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}.${fileExt || 'png'}`;

  const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}
