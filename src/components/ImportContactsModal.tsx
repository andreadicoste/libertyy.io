import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Download, FileUp, Loader2, Upload, XCircle, ArrowDownToLine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Contact } from '@/types/database';
import { ImportCounts, ImportPreviewRow } from '@/types/import';
import { parseContactsCSV } from '@/utils/parseContactsCSV';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

const INITIAL_COUNTS: ImportCounts = {
  valid: 0,
  duplicate: 0,
  error: 0,
  total: 0,
};

interface ImportContactsModalProps {
  existingContacts: Contact[];
  onContactsImported: () => void;
}

const statusConfig = {
  valid: {
    label: 'Importabile',
    icon: CheckCircle2,
    textClass: 'text-emerald-700',
  },
  duplicate: {
    label: 'Duplicato',
    icon: AlertTriangle,
    textClass: 'text-amber-700',
  },
  error: {
    label: 'Errore',
    icon: XCircle,
    textClass: 'text-rose-700',
  },
} as const;

export function ImportContactsModal({ existingContacts, onContactsImported }: ImportContactsModalProps) {
  const [open, setOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [counts, setCounts] = useState<ImportCounts>(INITIAL_COUNTS);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { company } = useProfile();

  const validRows = useMemo(() => previewRows.filter(row => row.status === 'valid'), [previewRows]);

  useEffect(() => {
    if (!open) {
      setPreviewRows([]);
      setCounts(INITIAL_COUNTS);
      setSelectedFileName('');
      setParsing(false);
      setImporting(false);
      setDragActive(false);
    }
  }, [open]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setParsing(true);
    try {
      setSelectedFileName(file.name);
      if (!company?.id) {
        toast.error('Nessuna azienda associata');
        setParsing(false);
        return;
      }
      const { rows, counts: newCounts } = await parseContactsCSV({
        file,
        companyId: company.id,
        existingContacts,
      });

      if (rows.length === 0) {
        toast.info('Il file selezionato non contiene contatti');
      }

      setPreviewRows(rows);
      setCounts(newCounts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante la lettura del CSV';
      toast.error(message);
      setPreviewRows([]);
      setCounts(INITIAL_COUNTS);
      setSelectedFileName('');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!dragActive) {
      setDragActive(true);
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;
    if (!company?.id) {
      toast.error('Nessuna azienda associata');
      return;
    }
    setImporting(true);
    try {
      const payload = validRows.map(row => row.payload);
      const { error } = await supabase.from('contacts').insert(payload);
      if (error) throw error;
      toast.success(`Importati ${payload.length} contatti`);
      setOpen(false);
      onContactsImported();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante l’importazione';
      toast.error(message);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = 'name,email,phone,address,notes,estimate,stage\n';
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contacts-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Valido', value: counts.valid, accent: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
    { label: 'Duplicati', value: counts.duplicate, accent: 'text-amber-600 border-amber-200 bg-amber-50' },
    { label: 'Errori', value: counts.error, accent: 'text-rose-600 border-rose-200 bg-rose-50' },
    { label: 'Totale', value: counts.total, accent: 'text-neutral-700 border-neutral-200 bg-neutral-50' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Importa contatti">
          <ArrowDownToLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl space-y-6">
        <DialogHeader>
          <DialogTitle>Importa contatti</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Carica un file CSV con le colonne: name, email, phone, address, notes, estimate, stage.
          </p>
        </DialogHeader>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition',
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30',
          )}
        >
          <FileUp className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Trascina qui il file oppure</p>
          <Button type="button" variant="outline" className="mt-4" disabled={parsing} onClick={() => fileInputRef.current?.click()}>
            {parsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisi in corso...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Carica CSV
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={event => {
              handleFile(event.target.files?.[0]);
              if (event.target) {
                event.target.value = '';
              }
            }}
          />
          {selectedFileName && (
            <p className="mt-3 text-xs font-medium text-foreground">File selezionato: {selectedFileName}</p>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-4 gap-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleDownloadTemplate}
          >
            <Download className="h-3.5 w-3.5" />
            Scarica template CSV
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className={cn('rounded-lg border p-4 text-center text-sm font-semibold', stat.accent)}>
              {stat.label}: <span className="text-2xl">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Anteprima contatti</p>
            {previewRows.length > 0 && (
              <p className="text-xs text-muted-foreground">Solo i contatti in verde verranno importati</p>
            )}
          </div>
          <div className="max-h-80 overflow-auto rounded-xl border">
            {previewRows.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Nessun CSV caricato
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Telefono</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Preventivo</th>
                    <th className="px-4 py-3 font-medium">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map(row => {
                    const config = statusConfig[row.status];
                    const Icon = config.icon;
                    const rowBg =
                      row.status === 'valid'
                        ? 'bg-emerald-50'
                        : row.status === 'duplicate'
                          ? 'bg-amber-50'
                          : 'bg-rose-50';
                    return (
                      <tr key={row.id} className={cn('border-t text-sm', rowBg)}>
                        <td className="px-4 py-3 font-medium text-foreground">{row.payload.name}</td>
                        <td className="px-4 py-3">{row.payload.email || '—'}</td>
                        <td className="px-4 py-3">{row.payload.phone || '—'}</td>
                        <td className="px-4 py-3 capitalize">{row.payload.stage}</td>
                        <td className="px-4 py-3">{row.payload.estimate ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className={cn('flex flex-col gap-1 text-xs font-semibold', config.textClass)}>
                            <span className="flex items-center gap-1">
                              <Icon className="h-4 w-4" />
                              {config.label}
                            </span>
                            {row.issues.length > 0 && (
                              <span className="font-normal text-[11px] text-neutral-600">{row.issues.join(', ')}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button type="button" disabled={validRows.length === 0 || importing} onClick={handleImport}>
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importazione...
              </>
            ) : (
              <>Importa {validRows.length} contatti</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
