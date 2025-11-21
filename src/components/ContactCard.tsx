import { Contact } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Mail, Phone, FileText, Eye } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  onOpenDetail?: (contact: Contact) => void;
}

export function ContactCard({ contact, onOpenDetail }: ContactCardProps) {
  return (
    <Card className="relative p-4 cursor-move hover:shadow-md transition-shadow bg-card">
      {onOpenDetail && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(contact);
          }}
          className="absolute top-2 right-2 rounded-md bg-white/80 p-1 opacity-60 shadow-sm transition hover:opacity-100"
        >
          <Eye className="h-4 w-4 text-neutral-700" />
        </button>
      )}

      {/* NAME — NO MARGIN BELOW */}
      <h3 className="font-semibold text-card-foreground mb-0">
        {contact.name}
      </h3>

      {/* EMAIL */}
      {contact.email && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2.5 mb-2.5">
          <Mail className="h-4 w-4" />
          <span className="truncate">{contact.email}</span>
        </div>
      )}

      {/* PHONE */}
      {contact.phone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2.5 mb-2.5">
          <Phone className="h-4 w-4" />
          <span>{contact.phone}</span>
        </div>
      )}

      {/* NOTES */}
      {contact.notes && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2.5">
          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{contact.notes}</span>
        </div>
      )}

    </Card>
  );
}
