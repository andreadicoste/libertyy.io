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

interface CreateContactModalProps {
  companyId: string;
  onContactCreated: () => void;
}

export function CreateContactModal({ companyId, onContactCreated }: CreateContactModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    stage: 'da contattare',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('contacts').insert({
        company_id: companyId,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        notes: formData.notes || null,
        stage: formData.stage,
      });

      if (error) throw error;

      toast.success('Contatto creato con successo');
      setFormData({ name: '', email: '', phone: '', notes: '', stage: 'da contattare' });
      setOpen(false);
      onContactCreated();
    } catch (error: any) {
      toast.error(error.message || 'Errore durante la creazione del contatto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Contatto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Contatto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Mario Rossi"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="mario@esempio.it"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+39 123 456 7890"
            />
          </div>

          <div>
            <Label htmlFor="stage">Stage</Label>
            <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="da contattare">Da Contattare</SelectItem>
                <SelectItem value="contattato">Contattato</SelectItem>
                <SelectItem value="negoziazione">Negoziazione</SelectItem>
                <SelectItem value="acquisito">Acquisito</SelectItem>
                <SelectItem value="perso">Perso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creazione...' : 'Crea Contatto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
