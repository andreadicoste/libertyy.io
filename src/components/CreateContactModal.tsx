import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { STAGES } from '@/constants/stages';
import { useProfile } from '@/hooks/useProfile';

interface CreateContactModalProps {
  onContactCreated: () => void;
}

export function CreateContactModal({ onContactCreated }: CreateContactModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { company } = useProfile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    stage: 'da contattare',
    source: '',
    estimate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!company?.id) {
        toast.error('Nessuna azienda associata');
        setLoading(false);
        return;
      }
      const payload = {
        company_id: company.id,
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        notes: formData.notes.trim() || null,
        stage: formData.stage,
        source: formData.source.trim() || null,
        estimate: formData.estimate ? Number(formData.estimate) : null,
      };

      const { error } = await supabase.from('contacts').insert(payload);

      if (error) throw error;

      toast.success('Contatto creato con successo');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        stage: 'da contattare',
        source: '',
        estimate: '',
      });
      setOpen(false);
      onContactCreated();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore durante la creazione del contatto';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-5 py-2 font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Crea contatto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nuovo contatto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Mario Rossi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+39 123 456 7890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="mario@esempio.it"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Via Roma 1, Milano"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Seleziona uno stage" />
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
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Campagna, referral..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimate">Preventivo (€)</Label>
              <Input
                id="estimate"
                type="number"
                min="0"
                value={formData.estimate}
                onChange={(e) => setFormData({ ...formData, estimate: e.target.value })}
                placeholder="5000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive..."
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creazione...' : 'Crea contatto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
