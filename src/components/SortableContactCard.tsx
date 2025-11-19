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
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
      {...attributes}
      {...listeners}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <ContactCard contact={contact} />
    </div>
  );
}
