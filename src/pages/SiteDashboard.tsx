import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Site } from '@/types/database';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCcw, Link2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { QRCodeCanvas } from 'qrcode.react';

interface SitePageInfo {
  title: string;
  path: string;
}

export default function SiteDashboard() {
  const { company, loading: profileLoading } = useProfile();
  const [site, setSite] = useState<Site | null>(null);
  const [siteLoading, setSiteLoading] = useState(true);
  const [pages, setPages] = useState<SitePageInfo[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  useEffect(() => {
    const loadSite = async () => {
      if (!company?.id) return;
      setSiteLoading(true);
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('*')
          .eq('company_id', company.id)
          .single();
        if (error) throw error;
        setSite(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Impossibile caricare il sito';
        toast.error(message);
        setSite(null);
      } finally {
        setSiteLoading(false);
      }
    };
    loadSite();
  }, [company?.id]);

  useEffect(() => {
    const loadPages = async () => {
      if (!site?.site_url) return;
      setPagesLoading(true);
      setPagesError(null);
      try {
        const sanitizedUrl = site.site_url.replace(/\/$/, '');
        const response = await fetch(`${sanitizedUrl}/api/pages`);
        if (!response.ok) throw new Error('Endpoint non disponibile');
        const payload = await response.json();
        setPages(Array.isArray(payload.pages) ? payload.pages : []);
      } catch (error) {
        const message = `Impossibile recuperare la lista delle pagine. Assicurati che il sito del cliente esponga /api/pages`;
        setPagesError(message);
        setPages([]);
      } finally {
        setPagesLoading(false);
      }
    };
    loadPages();
  }, [site?.site_url]);

  const lastPublishLabel = useMemo(() => {
    if (!site?.last_publish) return 'Mai pubblicato';
    try {
      return formatDistanceToNow(new Date(site.last_publish), { addSuffix: true, locale: it });
    } catch {
      return '—';
    }
  }, [site?.last_publish]);

  const sanitizedSiteUrl = site?.site_url ? site.site_url.replace(/\/$/, '') : '';

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">Caricamento profilo...</div>
        </main>
      </div>
    );
  }

  if (!company?.id) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold text-foreground">Nessuna azienda associata</h2>
            <p className="text-muted-foreground">Contatta l'amministratore del sistema.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen overflow-hidden">
        <div className="space-y-8 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Sito web</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Monitora lo stato del sito web aziendale</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="rounded-2xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Preview live</p>
                    <p className="text-lg font-semibold">{site?.project_name || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={site?.status || 'ready'} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => site?.site_url && window.open(site.site_url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Apri sito
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  {siteLoading ? (
                    <div className="flex h-[600px] items-center justify-center rounded-xl border bg-muted">
                      Caricamento sito...
                    </div>
                  ) : site?.site_url ? (
                    <iframe
                      src={site.site_url}
                      className="h-[600px] w-full rounded-xl border bg-white"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  ) : (
                    <div className="flex h-[600px] items-center justify-center rounded-xl border bg-muted">
                      Nessun sito configurato
                    </div>
                  )}
                  {site?.primary_domain && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-primary"
                        onClick={() => window.open(`https://${site.primary_domain}`, '_blank')}
                      >
                        <Link2 className="h-4 w-4" />
                        {site.primary_domain}
                      </button>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        Stato:
                        <StatusBadge status={site.status} />
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Pagine principali</h2>
                    <p className="text-sm text-muted-foreground">Gestisci l'accesso rapido alle pagine del sito</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => sanitizedSiteUrl && window.open(`${sanitizedSiteUrl}/api/pages`, '_blank')}
                    disabled={!sanitizedSiteUrl}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    <span className="sr-only">Apri API pagine</span>
                  </Button>
                </div>
                {pagesLoading ? (
                  <div className="py-12 text-center text-muted-foreground">Caricamento pagine...</div>
                ) : pagesError ? (
                  <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    {pagesError}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {pages.map(page => (
                      <div key={page.path} className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
                        <div>
                          <p className="font-semibold text-foreground">{page.title}</p>
                          <p className="text-sm text-muted-foreground">{page.path}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sanitizedSiteUrl && window.open(`${sanitizedSiteUrl}${page.path}`, '_blank')}
                          >
                            Apri
                          </Button>
                          <div className="rounded-lg border bg-white p-2">
                            <QRCodeCanvas
                              value={`${sanitizedSiteUrl}${page.path}`}
                              size={64}
                              bgColor="#ffffff"
                              fgColor="#000000"
                              includeMargin={false}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {pages.length === 0 && (
                      <div className="col-span-full rounded-xl border border-dashed border-neutral-200 bg-background p-6 text-center text-muted-foreground">
                        Nessuna pagina trovata.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Info sito</h2>
                <InfoItem label="Nome progetto" value={site?.project_name || '—'} />
                <InfoItem label="Dominio primario" value={site?.primary_domain || '—'} />
                <InfoItem label="Stato deploy" value={<StatusBadge status={site?.status || 'ready'} label />} />
                <InfoItem label="Ultimo deploy" value={lastPublishLabel} />
                <InfoItem label="Creato il" value={site?.created_at ? new Date(site.created_at).toLocaleDateString('it-IT') : '—'} />
                <InfoItem label="Tracking" value={site?.analytics_tracking || 'Non configurato'}>
                  <Button variant="link" className="p-0 text-sm">Modifica tracking</Button>
                </InfoItem>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status, label = false }: { status: string; label?: boolean }) {
  const normalized = status || 'ready';
  const color =
    {
      ready: 'bg-green-500',
      building: 'bg-yellow-500',
      error: 'bg-red-500',
    }[normalized as 'ready' | 'building' | 'error'] || 'bg-neutral-400';
  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label && <span className="capitalize">{normalized}</span>}
    </span>
  );
}

function InfoItem({
  label,
  value,
  children,
}: {
  label: string;
  value: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border pb-3 pt-3 last:border-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between text-sm text-foreground">
        <div>{value}</div>
        {children}
      </div>
    </div>
  );
}
