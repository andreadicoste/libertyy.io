import { Contact } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Eye } from 'lucide-react';
import { type CheckedState } from '@radix-ui/react-checkbox';
import { STAGE_BADGE_CLASSES, STAGE_LABELS } from '@/constants/stages';

interface ContactsTableProps {
  companyId: string;
  contacts: Contact[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onContactSelect: (contact: Contact) => void;
}

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
});

export function ContactsTable({
  companyId: _companyId,
  contacts,
  loading,
  selectedIds,
  onSelectionChange,
  onContactSelect,
}: ContactsTableProps) {
  const filteredContacts = contacts;

  const toggleContactSelection = (contactId: string, checked: CheckedState) => {
    onSelectionChange(
      checked ? Array.from(new Set([...selectedIds, contactId])) : selectedIds.filter(id => id !== contactId),
    );
  };

  const toggleSelectAll = (checked: CheckedState) => {
    if (checked) {
      onSelectionChange(filteredContacts.map(contact => contact.id));
      return;
    }
    onSelectionChange([]);
  };

  const allVisibleSelected =
    filteredContacts.length > 0 && filteredContacts.every(contact => selectedIds.includes(contact.id));

  const isIndeterminate = selectedIds.length > 0 && !allVisibleSelected;
  const bulkCheckedState: CheckedState = allVisibleSelected ? true : isIndeterminate ? 'indeterminate' : false;

  const formatDate = (value: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value?: number | null) => {
    if (typeof value !== 'number') return '-';
    return currencyFormatter.format(value);
  };

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          Caricamento contatti...
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground">
          Nessun contatto trovato per i filtri selezionati.
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={bulkCheckedState} onCheckedChange={toggleSelectAll} aria-label="Seleziona tutti i contatti" />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Indirizzo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead>Preventivo (€)</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map(contact => (
              <TableRow key={contact.id} className="last:border-b-0">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(contact.id)}
                    onCheckedChange={checked => toggleContactSelection(contact.id, checked)}
                    aria-label={`Seleziona ${contact.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">{contact.name}</TableCell>
                <TableCell className="text-muted-foreground">{contact.phone || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{contact.email || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{contact.address || '-'}</TableCell>
                <TableCell>
                  <Badge className={STAGE_BADGE_CLASSES[contact.stage]}>
                    {STAGE_LABELS[contact.stage] || contact.stage}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{contact.source || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{formatCurrency(contact.estimate)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(contact.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => onContactSelect(contact)}>
                    <Eye className="h-4 w-4" />
                    Dettagli
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
