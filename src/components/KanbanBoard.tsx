import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Contact, ContactStage } from '@/types/database';
import { KanbanColumn } from './KanbanColumn';
import { ContactCard } from './ContactCard';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { STAGES } from '@/constants/stages';

interface KanbanBoardProps {
  contacts: Contact[];
  loading: boolean;
  setContacts: Dispatch<SetStateAction<Contact[]>>;
  onReloadContacts: () => void;
  onContactSelect: (contact: Contact) => void;
}

export function KanbanBoard({ contacts, loading, setContacts, onReloadContacts, onContactSelect }: KanbanBoardProps) {
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  const stageIds = useMemo(() => STAGES.map(stage => stage.id), []);

  const isValidStage = (value: string): value is ContactStage => {
    return stageIds.includes(value as ContactStage);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveContact(null);

    if (!over || active.id === over.id) return;

    const contactId = active.id as string;
    const overId = over.id as string;

    if (!isValidStage(overId)) {
      return;
    }

    const newStage = overId;

    // Optimistic update
    setContacts(prev =>
      prev.map(contact =>
        contact.id === contactId ? { ...contact, stage: newStage } : contact
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
    } catch (error: unknown) {
      toast.error('Errore nell\'aggiornamento');
      onReloadContacts(); // Reload on error
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
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage.id}
            title={stage.title}
            contacts={getContactsByStage(stage.id)}
            onContactSelect={onContactSelect}
          />
        ))}
      </div>

      <DragOverlay>{activeContact ? <ContactCard contact={activeContact} /> : null}</DragOverlay>
    </DndContext>
  );
}
