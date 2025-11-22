import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from 'lib/supabase-server';

const PROFILE_COLUMNS = 'id, company_id, email, full_name, avatar_url, role, created_at';
const COMPANY_COLUMNS = 'id, company_name, user_id, site_url, ga_measurement_id';

async function ensureCompanyForProfile(
  supabase: ReturnType<typeof supabaseServer>,
  profileId: string,
  fullName?: string | null,
) {
  const defaultName = fullName?.trim() ? `${fullName.trim()} - Azienda` : 'Nuova azienda';

  const { data: insertedCompany, error: insertError } = await supabase
    .from('companies')
    .insert({
      company_name: defaultName,
      user_id: profileId,
      site_url: null,
      ga_measurement_id: null,
    })
    .select(COMPANY_COLUMNS)
    .single();

  if (insertError) throw insertError;

  const { error: updateError } = await supabase.from('profiles').update({ company_id: insertedCompany.id }).eq('id', profileId);
  if (updateError) throw updateError;

  return insertedCompany;
}

export async function GET() {
  const supabase = supabaseServer();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ profile: null, company: null }, { status: 401 });
  }

  const userId = session.user.id;

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profileData) {
    return NextResponse.json({ profile: null, company: null }, { status: 404 });
  }

  const normalizedProfile = {
    ...profileData,
    email: profileData.email ?? session.user.email ?? null,
    full_name: profileData.full_name ?? null,
    avatar_url: profileData.avatar_url ?? null,
    role: profileData.role ?? null,
    created_at: profileData.created_at ?? new Date().toISOString(),
  };

  let companyRecord: any = null;

  if (normalizedProfile.company_id) {
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select(COMPANY_COLUMNS)
      .eq('id', normalizedProfile.company_id)
      .maybeSingle();

    if (companyError && companyError.code !== 'PGRST116') {
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }

    if (companyData) {
      companyRecord = companyData;
    }
  }

  if (!companyRecord) {
    companyRecord = await ensureCompanyForProfile(supabase, normalizedProfile.id, normalizedProfile.full_name);
    normalizedProfile.company_id = companyRecord.id;
  }

  return NextResponse.json({ profile: normalizedProfile, company: companyRecord });
}

export async function PATCH(request: NextRequest) {
  const supabase = supabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
  }

  const payload = await request.json();

  const updates: Record<string, string | null | undefined> = {};
  if (payload.full_name !== undefined) updates.full_name = payload.full_name;
  if (payload.avatar_url !== undefined) updates.avatar_url = payload.avatar_url;

  const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
