import { supabaseBrowser } from 'lib/supabase-browser';

const slugifyString = (value: string) =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/-{2,}/g, '-')
    .trim();

export function slugify(input: string) {
  const cleaned = slugifyString(input);
  return cleaned || 'articolo';
}

export async function generateUniqueSlug(title: string, companyId: string, excludeId?: string) {
  const supabase = supabaseBrowser();
  const base = slugify(title);
  let attempt = base;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = supabase.from('articles').select('id').eq('company_id', companyId).eq('slug', attempt);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      throw error;
    }
    if (!data) {
      return attempt;
    }
    counter += 1;
    attempt = `${base}-${counter}`;
  }
}
