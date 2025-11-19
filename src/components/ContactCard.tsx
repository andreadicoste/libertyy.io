import { Contact } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Mail, Phone, FileText } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Card className="p-4 cursor-move hover:shadow-md transition-shadow bg-card">
      
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