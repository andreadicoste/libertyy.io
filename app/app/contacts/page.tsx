'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { KanbanBoard } from 'components/KanbanBoard';
import { ContactsTable } from 'components/ContactsTable';
import { supabaseBrowser } from 'lib/supabase-browser';
import { Contact } from 'types/database';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { ContactDetailModal } from 'components/ContactDetailModal';
import { Input } from 'components/ui/input';
import { CreateContactModal } from 'components/CreateContactModal';
import { ViewToggle } from 'components/ViewToggle';
import { ContactFilters } from 'types/filters';
import { FilterMenu } from 'components/FilterMenu';
import { ExportButton } from 'components/ExportButton';
import { exportContactsToCSV } from 'utils/exportContactsToCSV';
import { ImportContactsModal } from 'components/ImportContactsModal';
import { useProfile } from 'hooks/useProfile';

export default function ContattiPage() {
  const supabase = supabaseBrowser();
  const { profile, company, loading: profileLoading } = useProfile();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ContactFilters>({
    stages: [],
    hasEmail: 'all',
    hasPhone: 'all',
    createdFrom: '',
    createdTo: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadContacts = useCallback(async () => {
    if (!company?.id) return;
    setContactsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setContacts(data || []);
    } catch (error: unknown) {
      toast.error('Errore nel caricamento dei contatti');
    } finally {
      setContactsLoading(false);
    }
  }, [company?.id, supabase]);

  useEffect(() => {
    if (company?.id) {
      loadContacts();
    }
  }, [company?.id, loadContacts]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setDetailOpen(true);
  };

  const handleModalChange = (open: boolean) => {
    if (!open) {
      setSelectedContact(null);
    }
    setDetailOpen(open);
  };

  const filteredByFilters = useMemo(() => {
    return contacts.filter(contact => {
      if (filters.stages.length > 0 && !filters.stages.includes(contact.stage)) {
        return false;
      }

      if (filters.hasEmail === 'yes' && !contact.email) return false;
      if (filters.hasEmail === 'no' && contact.email) return false;

      if (filters.hasPhone === 'yes' && !contact.phone) return false;
      if (filters.hasPhone === 'no' && contact.phone) return false;

      if (filters.createdFrom) {
        const fromDate = new Date(filters.createdFrom);
        if (new Date(contact.created_at) < fromDate) return false;
      }

      if (filters.createdTo) {
        const toDate = new Date(filters.createdTo);
        if (new Date(contact.created_at) > toDate) return false;
      }

      return true;
    });
  }, [contacts, filters]);

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return filteredByFilters;

    return filteredByFilters.filter(contact => {
      const haystack = [
        contact.name,
        contact.email || '',
        contact.phone || '',
        contact.stage || '',
        contact.address || '',
        contact.source || '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [filteredByFilters, searchTerm]);

  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => filteredContacts.some(contact => contact.id === id)));
  }, [filteredContacts]);

  const dynamicSubtitle = viewMode === 'kanban' ? 'CRM Pipeline' : 'Elenco contatti';

  const handleExport = () => {
    const dataset =
      viewMode === 'table'
        ? filteredContacts.filter(contact => selectedIds.includes(contact.id))
        : filteredContacts;

    if (dataset.length === 0) {
      toast.info('Nessun contatto da esportare');
      return;
    }

    exportContactsToCSV(dataset);
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Caricamento contatti...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-foreground">Nessuna azienda associata</h2>
          <p className="text-muted-foreground">Contatta l&apos;amministratore del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase text-neutral-500">Contatti</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Gestisci la pipeline o la tabella contatti</h1>
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
        <div>
          <h2 className="text-xl font-semibold text-foreground">{dynamicSubtitle}</h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CreateContactModal onContactCreated={loadContacts} />
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
          <div className="flex items-center gap-2">
            <ImportContactsModal existingContacts={contacts} onContactsImported={loadContacts} />
            <ExportButton onExport={handleExport} disabled={contactsLoading} />
            <FilterMenu filters={filters} onChange={setFilters} />
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cerca per nome, email, fonte..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard
          contacts={filteredContacts}
          loading={contactsLoading}
          setContacts={setContacts}
          onReloadContacts={loadContacts}
          onContactSelect={handleContactSelect}
        />
      ) : (
        <ContactsTable
          contacts={filteredContacts}
          loading={contactsLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onContactSelect={handleContactSelect}
        />
      )}

      <ContactDetailModal
        open={detailOpen}
        onOpenChange={handleModalChange}
        contact={selectedContact}
        onContactUpdated={loadContacts}
      />
    </div>
  );
}
