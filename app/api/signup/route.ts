import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from 'lib/supabase-constants';

export async function POST(request: Request) {
  const { email, password, fullName, companyName } = await request.json();

  if (!email || !password || !fullName || !companyName) {
    return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Service role non configurata' }, { status: 500 });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (signUpError || !userData.user) {
    return NextResponse.json({ error: signUpError?.message || 'Signup fallita' }, { status: 400 });
  }

  const userId = userData.user.id;

  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email,
    full_name: fullName,
    role: 'user',
    company_id: null,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .insert({ company_name: companyName, user_id: userId })
    .select('id')
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: companyError?.message || 'Company creation failed' }, { status: 400 });
  }

  const { error: linkError } = await supabaseAdmin
    .from('profiles')
    .update({ company_id: company.id })
    .eq('id', userId);

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
