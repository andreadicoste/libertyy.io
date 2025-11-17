import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Contact } from '@/types/database';
import { ContactCard } from './ContactCard';

interface SortableContactCardProps {
  contact: Contact;
}

export function SortableContactCard({ contact }: SortableContactCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contact.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ContactCard contact={contact} />
    </div>
  );
}
