import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Contact, ContactStage } from 'types/database';
import { SortableContactCard } from './SortableContactCard';
import { cn } from 'lib/utils';
import { STAGE_COLORS, STAGE_LABELS } from 'constants/stageColors';

function normalizeStage(value: string): ContactStage {
  return value.replace(/"/g, '') as ContactStage;
}

interface KanbanColumnProps {
  stage: string;
  title: string;
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  activeId: string | null;
  overId: string | null;
}

export function KanbanColumn({
  stage,
  title,
  contacts,
  onContactSelect,
  activeId,
  overId
}: KanbanColumnProps) {

  const normalizedStage = normalizeStage(stage);

  const { setNodeRef, isOver } = useDroppable({ id: normalizedStage });

  const isOverColumn =
    isOver ||
    (overId ? contacts.some(contact => contact.id === overId) : false) ||
    overId === normalizedStage;

  const containerClasses = cn(
    'flex flex-col rounded-lg p-4 min-w-[280px] transition-colors duration-200 border',
    isOverColumn ? 'bg-sky-50 border-sky-200' : 'bg-muted/50 border-transparent'
  );

  const colorClass = (() => {
    const c = STAGE_COLORS[normalizedStage] ?? STAGE_COLORS['da contattare'];
    return c.solid || c.text.replace('text-', 'bg-');
  })();

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={cn('mr-2 h-3 w-3 rounded-sm', colorClass)} />
          <h3 className="font-semibold text-foreground">
            {STAGE_LABELS[normalizedStage] || title}
          </h3>
        </div>

        <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
          {contacts.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 space-y-3 min-h-[200px]">
        <SortableContext items={contacts.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {contacts.map((contact, index) => (
            <div key={contact.id}>
              <SortableContactCard
                contact={{ ...contact, stage: normalizedStage }}
                onContactSelect={onContactSelect}
              />
            </div>
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
