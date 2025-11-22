import { redirect } from 'next/navigation';

export default function LegacySiteContentsRedirect() {
  redirect('/app/site/contents');
}
