import { redirect } from 'next/navigation';

export default function LegacyContactsRedirect() {
  redirect('/app/contacts');
}
