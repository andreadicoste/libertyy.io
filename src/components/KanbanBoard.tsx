import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { Contact, ContactStage } from '@/types/database';
import { KanbanColumn } from './KanbanColumn';
import { ContactCard } from './ContactCard';
import { cn } from '@/lib/utils';
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const stageIds = useMemo(() => STAGES.map(stage => stage.id), []);

  const isValidStage = useCallback(
    (value: string): value is ContactStage => stageIds.includes(value as ContactStage),
    [stageIds],
  );

  const resetDragState = useCallback(() => {
    setActiveContact(null);
    setActiveId(null);
    setOverId(null);
    document.body.style.overflow = 'auto';
  }, []);

  const getContactsByStage = useCallback(
    (stage: string) => contacts.filter(contact => contact.stage === stage),
    [contacts],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const contact = contacts.find(c => c.id === event.active.id);
      setActiveContact(contact || null);
      setActiveId(String(event.active.id));
      document.body.style.overflow = 'hidden';
    },
    [contacts],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over ? String(event.over.id) : null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      resetDragState();
      if (!over || active.id === over.id) return;

      const contactId = String(active.id);
      const overStage = String(over.id);
      if (!isValidStage(overStage)) return;

      setContacts(prev =>
        prev.map(contact => (contact.id === contactId ? { ...contact, stage: overStage } : contact)),
      );

      try {
        const { error } = await supabase.from('contacts').update({ stage: overStage }).eq('id', contactId);
        if (error) throw error;
        toast.success('Contatto aggiornato');
      } catch (error) {
        toast.error("Errore nell'aggiornamento");
        onReloadContacts();
      }
    },
    [isValidStage, onReloadContacts, resetDragState, setContacts],
  );

  const handleDragCancel = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Caricamento contatti...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage.id}
            title={stage.title}
            contacts={getContactsByStage(stage.id)}
            onContactSelect={onContactSelect}
            activeId={activeId}
            overId={overId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeContact ? (
          <div
            className={cn(
              'pointer-events-none transform-gpu rounded-lg',
              'rotate-[-2deg] scale-[1.03] shadow-[0_8px_18px_rgba(0,0,0,0.15)] transition-transform duration-150 ease-out',
            )}
          >
            <ContactCard contact={activeContact} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
