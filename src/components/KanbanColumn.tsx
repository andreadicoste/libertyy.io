import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Contact } from '@/types/database';
import { SortableContactCard } from './SortableContactCard';

interface KanbanColumnProps {
  stage: string;
  title: string;
  contacts: Contact[];
}

export function KanbanColumn({ stage, title, contacts }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div className="flex flex-col bg-muted/50 rounded-lg p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
          {contacts.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 space-y-3 min-h-[200px]">
        <SortableContext items={contacts.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {contacts.map((contact) => (
            <SortableContactCard key={contact.id} contact={contact} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
