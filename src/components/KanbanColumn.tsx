import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Contact } from '@/types/database';
import { SortableContactCard } from './SortableContactCard';
import { cn } from '@/lib/utils';
import { STAGE_COLOR_CLASSES } from '@/constants/stages';

interface KanbanColumnProps {
  stage: string;
  title: string;
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  activeId: string | null;
  overId: string | null;
}

export function KanbanColumn({ stage, title, contacts, onContactSelect, activeId, overId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const isOverColumn = isOver || (overId ? contacts.some(contact => contact.id === overId) : false) || overId === stage;

  const containerClasses = cn(
    'flex flex-col rounded-lg p-4 min-w-[280px] transition-colors duration-200 border',
    isOverColumn ? 'bg-sky-50 border-sky-200' : 'bg-muted/50 border-transparent',
  );

  const computeIndicatorIndex = () => {
    if (!activeId || !isOverColumn) return null;
    if (!overId || overId === stage) {
      return contacts.length;
    }
    const overIndex = contacts.findIndex(contact => contact.id === overId);
    if (overIndex === -1) {
      return contacts.length;
    }
    return overIndex;
  };

  const indicatorIndex = computeIndicatorIndex();

  const renderIndicator = (key: string) => (
    <div key={key} className="my-1 h-[3px] rounded bg-sky-400" />
  );

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={cn('mr-2 h-3 w-3 rounded-sm', STAGE_COLOR_CLASSES[stage as keyof typeof STAGE_COLOR_CLASSES] || 'bg-neutral-400')} />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
          {contacts.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 space-y-3 min-h-[200px]">
        <SortableContext items={contacts.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {contacts.map((contact, index) => (
            <div key={contact.id}>
              {indicatorIndex === index && renderIndicator(`${contact.id}-indicator`)}
              <SortableContactCard contact={contact} onContactSelect={onContactSelect} />
            </div>
          ))}
          {indicatorIndex === contacts.length && renderIndicator(`${stage}-indicator-end`)}
        </SortableContext>
      </div>
    </div>
  );
}
