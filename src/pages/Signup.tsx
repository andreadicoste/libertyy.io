import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (!loading && profile) {
      navigate('/contatti');
    }
  }, [profile, loading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!fullName.trim() || !companyName.trim()) {
        toast.error('Inserisci nome completo e nome azienda');
        setSubmitting(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/contatti`;
      
      const { error } = await supabase.auth.signUp({
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

      toast.success('Registrazione completata! Verifica la tua email per confermare l\'account.');
      navigate('/login');
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
          <CardTitle className="text-2xl font-bold text-center">libertyy.io</CardTitle>
          <CardDescription className="text-center">
            Crea il tuo account
          </CardDescription>
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
            <Link to="/login" className="text-primary hover:underline font-medium">
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
