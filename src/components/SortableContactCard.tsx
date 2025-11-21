import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KeyboardEvent } from 'react';
import { Contact } from '@/types/database';
import { ContactCard } from './ContactCard';

interface SortableContactCardProps {
  contact: Contact;
  onContactSelect?: (contact: Contact) => void;
}

export function SortableContactCard({ contact, onContactSelect }: SortableContactCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: contact.id,
    disabled: { droppable: true },
  });

  const style = {
    transform: isDragging ? 'none' : CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.67 : 1,
    boxShadow: isDragging ? 'none' : undefined,
  };

  const handleClick = () => {
    if (isDragging) return;
    onContactSelect?.(contact);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <ContactCard contact={contact} onOpenDetail={onContactSelect} />
    </div>
  );
}
