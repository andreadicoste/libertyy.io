import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Contact } from '@/types/database';
import { KanbanColumn } from './KanbanColumn';
import { ContactCard } from './ContactCard';
import { CreateContactModal } from './CreateContactModal';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const STAGES = [
  { id: 'da contattare', title: 'Da Contattare' },
  { id: 'contattato', title: 'Contattato' },
  { id: 'negoziazione', title: 'Negoziazione' },
  { id: 'acquisito', title: 'Acquisito' },
  { id: 'perso', title: 'Perso' },
];

interface KanbanBoardProps {
  companyId: string;
}

export function KanbanBoard({ companyId }: KanbanBoardProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast.error('Errore nel caricamento dei contatti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [companyId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveContact(null);

    if (!over || active.id === over.id) return;

    const contactId = active.id as string;
    const newStage = over.id as string;

    // Optimistic update
    setContacts(prev =>
      prev.map(contact =>
        contact.id === contactId ? { ...contact, stage: newStage as any } : contact
      )
    );

    // Update in database
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ stage: newStage })
        .eq('id', contactId);

      if (error) throw error;
      toast.success('Contatto aggiornato');
    } catch (error: any) {
      toast.error('Errore nell\'aggiornamento');
      loadContacts(); // Reload on error
    }
  };

  const handleDragStart = (event: DragEndEvent) => {
    const contact = contacts.find(c => c.id === event.active.id);
    setActiveContact(contact || null);
  };

  const getContactsByStage = (stage: string) => {
    return contacts.filter(contact => contact.stage === stage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Caricamento contatti...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">CRM Pipeline</h2>
        <CreateContactModal companyId={companyId} onContactCreated={loadContacts} />
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage.id}
              title={stage.title}
              contacts={getContactsByStage(stage.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeContact ? <ContactCard contact={activeContact} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
