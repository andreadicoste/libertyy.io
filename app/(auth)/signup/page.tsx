'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/contatti');
    }
  }, [user, loading, router]);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (!fullName.trim() || !companyName.trim()) {
        toast.error('Inserisci nome completo e nome azienda');
        setSubmitting(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/contatti`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      const userId = data.user?.id;
      const userEmail = data.user?.email ?? email;

      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: userEmail,
              full_name: fullName.trim(),
              avatar_url: null,
              role: 'member',
              company_id: null,
              created_at: new Date().toISOString(),
            },
            { onConflict: 'id' },
          );
        if (profileError) throw profileError;

        const { data: companyInsert, error: companyError } = await supabase
          .from('companies')
          .insert({ company_name: companyName.trim(), user_id: userId })
          .select('id')
          .single();
        if (companyError) throw companyError;

        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ company_id: companyInsert.id })
          .eq('id', userId);
        if (profileUpdateError) throw profileUpdateError;
      }

      toast.success("Registrazione completata! Verifica la tua email per confermare l'account.");
      router.push('/login');
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        toast.error('Email già registrata. Prova ad accedere.');
      } else {
        toast.error(error.message || 'Errore durante la registrazione');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">libertyy.io</CardTitle>
          <CardDescription className="text-center">Crea il tuo account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo *</Label>
              <Input
                id="fullName"
                placeholder="Mario Rossi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome azienda *</Label>
              <Input
                id="companyName"
                placeholder="La Mia Azienda"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Registrazione in corso...' : 'Registrati'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Hai già un account? </span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
