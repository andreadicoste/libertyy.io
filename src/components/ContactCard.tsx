import { Contact } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Mail, Phone, FileText } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Card className="p-4 cursor-move hover:shadow-md transition-shadow bg-card">
      <h3 className="font-semibold text-card-foreground mb-2">{contact.name}</h3>
      
      {contact.email && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Mail className="h-4 w-4" />
          <span className="truncate">{contact.email}</span>
        </div>
      )}
      
      {contact.phone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Phone className="h-4 w-4" />
          <span>{contact.phone}</span>
        </div>
      )}
      
      {contact.notes && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{contact.notes}</span>
        </div>
      )}
    </Card>
  );
}
