import { redirect } from 'next/navigation';

export default function LegacySiteDashboardRedirect() {
  redirect('/app/site/dashboard');
}
