import { supabase } from '@/lib/supabase';

export async function uploadAvatar(file: File, userId: string) {
  const filePath = `${userId}/${file.name}`;

  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

  const publicUrl = data.publicUrl;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  if (profileError) throw profileError;

  return publicUrl;
}
