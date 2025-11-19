import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileWithEmail, updateProfile } from '@/hooks/useProfile';
import { Company } from '@/types/database';
import { uploadAvatar } from '@/utils/uploadAvatar';
import { Camera, Building, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileWithEmail | null;
  company: Company | null;
  refreshProfile: () => Promise<void> | void;
}

const initialsFrom = (name?: string | null, email?: string | null) => {
  const source = name || email || '';
  if (!source) return 'U';
  return source
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: '2-digit' });
};

export function ProfileModal({ open, onOpenChange, profile, company, refreshProfile }: ProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [open, profile]);

  const handleAvatarChange = async (file?: File) => {
    if (!file || !profile) return;
    setUploading(true);
    try {
      const publicUrl = await uploadAvatar(file, profile.id);
      setAvatarUrl(publicUrl);
      toast.success('Avatar aggiornato, salva per confermare');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante il caricamento';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) {
      toast.error('Email non disponibile');
      return;
    }
    try {
      await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      toast.success('Email per il reset inviata');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante il reset';
      toast.error(message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        avatar_url: avatarUrl || null,
      });
      toast.success('Profilo aggiornato');
      await refreshProfile();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante il salvataggio';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden p-0 sm:p-0">
        <div className="flex h-full flex-col">
          <DialogHeader className="shrink-0 px-6 pt-6">
            <DialogTitle>Profilo utente</DialogTitle>
            <p className="text-sm text-muted-foreground">Gestisci i dati del tuo account e della tua azienda.</p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-6 px-6 pb-6 pt-4">
              <section className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Dati personali</p>
                  <p className="text-sm text-neutral-500">Aggiorna il tuo nome e la foto profilo</p>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl || undefined} alt={profile?.full_name || 'Avatar'} />
                    <AvatarFallback>{initialsFrom(profile?.full_name, profile?.email)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Camera className="h-4 w-4" />
                      {uploading ? 'Caricamento...' : 'Cambia foto'}
                    </Button>
                    <p className="text-xs text-neutral-500">PNG o JPG, dimensione massima 2MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={event => {
                        handleAvatarChange(event.target.files?.[0]);
                        if (event.target) event.target.value = '';
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={event => setFullName(event.target.value)}
                      placeholder="Il tuo nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile?.email || ''} disabled />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-neutral-500">Password</p>
                    <Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={handlePasswordReset}>
                      Cambia password
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Account creato il</Label>
                    <Input value={formatDate(profile?.created_at)} disabled />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Azienda</p>
                    <p className="text-sm text-neutral-500">Dati dell’azienda collegata</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nome azienda</Label>
                  <Input value={company?.company_name || '—'} disabled />
                </div>
              </section>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-neutral-200 px-6 py-4">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Chiudi
                </Button>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvataggio...' : 'Salva modifiche'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
