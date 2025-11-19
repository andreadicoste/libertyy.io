import { useEffect, useState } from 'react';
import { Contact, ContactStage } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { STAGES, STAGE_LABELS } from '@/constants/stages';

interface ContactDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onContactUpdated: () => void;
}

interface ContactFormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  stage: ContactStage;
  source: string;
  estimate: string;
  notes: string;
}

const emptyForm: ContactFormState = {
  name: '',
  phone: '',
  email: '',
  address: '',
  stage: 'da contattare',
  source: '',
  estimate: '',
  notes: '',
};

export function ContactDetailModal({ open, onOpenChange, contact, onContactUpdated }: ContactDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ContactFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name ?? '',
        phone: contact.phone ?? '',
        email: contact.email ?? '',
        address: contact.address ?? '',
        stage: contact.stage,
        source: contact.source ?? '',
        estimate: contact.estimate !== null && contact.estimate !== undefined ? String(contact.estimate) : '',
        notes: contact.notes ?? '',
      });
    } else {
      setFormData(emptyForm);
    }
    setIsEditing(false);
    setSaving(false);
    setDeleting(false);
    setConfirmDeleteOpen(false);
  }, [contact, open]);

  const handleFieldChange = (field: keyof ContactFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStageChange = (value: ContactStage) => {
    setFormData(prev => ({ ...prev, stage: value }));
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsEditing(false);
      setConfirmDeleteOpen(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!contact) return;

    setSaving(true);
    try {
      const updates = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        stage: formData.stage,
        source: formData.source.trim() || null,
        estimate: formData.estimate ? Number(formData.estimate) : null,
        notes: formData.notes.trim() || null,
      };

      const { error } = await supabase.from('contacts').update(updates).eq('id', contact.id);
      if (error) throw error;

      toast.success('Contatto aggiornato con successo');
      setIsEditing(false);
      onContactUpdated();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore durante l\'aggiornamento del contatto';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;
    setDeleting(true);

    try {
      const { error } = await supabase.from('contacts').delete().eq('id', contact.id);
      if (error) throw error;

      toast.success('Contatto eliminato');
      setConfirmDeleteOpen(false);
      handleClose(false);
      onContactUpdated();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore durante l\'eliminazione del contatto';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const formatCreatedAt = (value?: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
        {!contact ? (
          <div className="py-12 text-center text-muted-foreground">
            Seleziona un contatto per visualizzare i dettagli.
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl">{contact.name}</DialogTitle>
              <DialogDescription>Visualizza e gestisci le informazioni del contatto.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Creato il {formatCreatedAt(contact.created_at)}
              </div>
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Modifica
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" disabled={saving} onClick={() => setIsEditing(false)}>
                    Annulla
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Salvataggio...' : 'Salva modifiche'}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={event => handleFieldChange('name', event.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={event => handleFieldChange('phone', event.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={event => handleFieldChange('email', event.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={event => handleFieldChange('address', event.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={formData.stage} onValueChange={value => handleStageChange(value as ContactStage)} disabled={!isEditing}>
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Seleziona stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Fonte</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={event => handleFieldChange('source', event.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimate">Preventivo (€)</Label>
                <Input
                  id="estimate"
                  type="number"
                  value={formData.estimate}
                  onChange={event => handleFieldChange('estimate', event.target.value)}
                  disabled={!isEditing}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Data creazione</Label>
                <Input value={formatCreatedAt(contact.created_at)} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={event => handleFieldChange('notes', event.target.value)}
                disabled={!isEditing}
                rows={4}
              />
            </div>

            <DialogFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Stage attuale:&nbsp;
                <span className="font-medium text-foreground">{STAGE_LABELS[contact.stage]}</span>
              </div>
              <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    Elimina contatto
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sei sicuro di eliminare questo contatto?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
                    <AlertDialogAction type="button" onClick={handleDelete} disabled={deleting}>
                      {deleting ? 'Eliminazione...' : 'Elimina definitivamente'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
