import { useMemo, useState } from 'react';
import { Contact } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Eye, Copy, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { type CheckedState } from '@radix-ui/react-checkbox';
import { STAGE_BADGE_CLASSES, STAGE_LABELS } from '@/constants/stages';
import { toast } from 'sonner';

interface ContactsTableProps {
  contacts: Contact[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onContactSelect: (contact: Contact) => void;
}

type SortKey = 'name' | 'phone' | 'email' | 'address' | 'stage' | 'source' | 'estimate' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
});

export function ContactsTable({ contacts, loading, selectedIds, onSelectionChange, onContactSelect }: ContactsTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: SortDirection }>({
    key: null,
    direction: null,
  });

  const STAGE_ORDER: Record<string, number> = {
    perso: 0,
    'da contattare': 1,
    contattato: 2,
    negoziazione: 3,
    acquisito: 4,
  };

  const toggleSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: null };
    });
  };

  const copyValue = (value?: string | null) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success('Copiato negli appunti');
  };

  const sortedContacts = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return [...contacts];
    const sorted = [...contacts].sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      const key = sortConfig.key!;

      const valA = a[key] as unknown;
      const valB = b[key] as unknown;

      const isNullA = valA === null || valA === undefined;
      const isNullB = valB === null || valB === undefined;
      if (isNullA && !isNullB) return 1;
      if (!isNullA && isNullB) return -1;
      if (isNullA && isNullB) return 0;

      if (key === 'stage') {
        const orderA = STAGE_ORDER[String(valA)] ?? Number.MAX_SAFE_INTEGER;
        const orderB = STAGE_ORDER[String(valB)] ?? Number.MAX_SAFE_INTEGER;
        return orderA === orderB ? 0 : orderA > orderB ? dir : -dir;
      }

      if (key === 'estimate') {
        const numA = typeof valA === 'number' ? valA : Number(valA);
        const numB = typeof valB === 'number' ? valB : Number(valB);
        return numA === numB ? 0 : numA > numB ? dir : -dir;
      }

      if (key === 'created_at') {
        const dateA = new Date(String(valA)).getTime();
        const dateB = new Date(String(valB)).getTime();
        return dateA === dateB ? 0 : dateA > dateB ? dir : -dir;
      }

      return String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base' }) * dir;
    });
    return sorted;
  }, [contacts, sortConfig]);

  const toggleContactSelection = (contactId: string, checked: CheckedState) => {
    onSelectionChange(
      checked ? Array.from(new Set([...selectedIds, contactId])) : selectedIds.filter(id => id !== contactId),
    );
  };

  const toggleSelectAll = (checked: CheckedState) => {
    if (checked) {
      onSelectionChange(sortedContacts.map(contact => contact.id));
      return;
    }
    onSelectionChange([]);
  };

  const allVisibleSelected =
    sortedContacts.length > 0 && sortedContacts.every(contact => selectedIds.includes(contact.id));

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
      ) : sortedContacts.length === 0 ? (
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
              {[
                { key: 'name', label: 'Nome' },
                { key: 'phone', label: 'Telefono' },
                { key: 'email', label: 'Email' },
                { key: 'address', label: 'Indirizzo' },
                { key: 'stage', label: 'Stato' },
                { key: 'source', label: 'Fonte' },
                { key: 'estimate', label: 'Preventivo (€)' },
                { key: 'created_at', label: 'Data' },
              ].map(col => (
                <TableHead
                  key={col.key}
                  onClick={() => toggleSort(col.key as SortKey)}
                  className="cursor-pointer select-none font-medium text-neutral-700"
                >
                  <span className="flex items-center gap-1">
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{col.label}</span>
                    <span className="opacity-40 group-hover:opacity-100">
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : sortConfig.direction === 'desc' ? (
                          <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </span>
                  </span>
                </TableHead>
              ))}
              <TableHead className="text-right font-medium text-neutral-700">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.map(contact => (
              <TableRow key={contact.id} className="last:border-b-0">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(contact.id)}
                    onCheckedChange={checked => toggleContactSelection(contact.id, checked)}
                    aria-label={`Seleziona ${contact.name}`}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis font-medium text-foreground">{contact.name}</TableCell>
                <TableCell className="pr-2 whitespace-nowrap overflow-hidden text-ellipsis text-muted-foreground">
                  <div
                    className="group flex items-center gap-1 whitespace-nowrap overflow-hidden cursor-pointer"
                    onClick={() => copyValue(contact.phone || '')}
                  >
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-black">
                      {contact.phone || '-'}
                    </span>
                    {contact.phone && (
                      <Copy className="h-4 w-4 text-neutral-400 opacity-0 transition group-hover:opacity-100 group-hover:text-black" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="pr-2 whitespace-nowrap overflow-hidden text-ellipsis text-muted-foreground">
                  <div
                    className="group flex items-center gap-1 whitespace-nowrap overflow-hidden cursor-pointer"
                    onClick={() => copyValue(contact.email || '')}
                  >
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-black">
                      {contact.email || '-'}
                    </span>
                    {contact.email && (
                      <Copy className="h-4 w-4 text-neutral-400 opacity-0 transition group-hover:opacity-100 group-hover:text-black" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis text-muted-foreground">
                  {contact.address || '-'}
                </TableCell>
                <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis">
                  <Badge className={STAGE_BADGE_CLASSES[contact.stage]}>
                    {STAGE_LABELS[contact.stage] || contact.stage}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis text-muted-foreground">
                  {contact.source || '-'}
                </TableCell>
                <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis text-muted-foreground">
                  {formatCurrency(contact.estimate)}
                </TableCell>
                <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis text-muted-foreground">
                  {formatDate(contact.created_at)}
                </TableCell>
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
