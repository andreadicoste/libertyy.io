import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Profile, Article } from '@/types/database';
import { toast } from 'sonner';
import { CMSArticleModal } from '@/components/CMSArticleModal';
import { ArticleCard } from '@/components/ArticleCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';

export default function CMSPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setProfileLoading(true);
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error) throw error;
        setProfile(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Errore nel caricamento del profilo';
        toast.error(message);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const loadArticles = useCallback(async () => {
    if (!profile?.company_id) return;
    setArticlesLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore nel caricamento degli articoli';
      toast.error(message);
    } finally {
      setArticlesLoading(false);
    }
  }, [profile?.company_id]);

  useEffect(() => {
    if (profile?.company_id) {
      loadArticles();
    }
  }, [profile?.company_id, loadArticles]);

  const filteredArticles = useMemo(() => {
    if (!searchTerm) return articles;
    const term = searchTerm.trim().toLowerCase();
    return articles.filter(article => {
      const haystack = [article.title, article.slug, article.content ?? '', article.excerpt ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [articles, searchTerm]);

  const articleCountLabel = filteredArticles.length === 1 ? '1 articolo' : `${filteredArticles.length} articoli`;

  const handleNew = () => {
    setSelectedArticle(null);
    setModalOpen(true);
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Caricamento profilo...</p>
        </main>
      </div>
    );
  }

  if (!profile?.company_id) {
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
      <main className="ml-64 min-h-screen overflow-x-hidden">
        <div className="space-y-8 p-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Sito web</p>
            <h1 className="text-3xl font-semibold text-foreground">Gestisci i contenuti del sito</h1>
            <p className="text-muted-foreground">Articoli del blog</p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Button onClick={handleNew} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo articolo
            </Button>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Cerca per titolo, slug, contenuto..."
                  className="pl-9"
                />
              </div>
              <Badge variant="outline" className="w-max border-neutral-200 bg-white text-neutral-700">
                {articleCountLabel}
              </Badge>
            </div>
          </div>

          {articlesLoading ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white">
              <p className="text-sm text-muted-foreground">Caricamento articoli...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white text-center">
              <p className="text-sm font-medium text-foreground">Nessun articolo</p>
              <p className="text-sm text-muted-foreground">Crea il primo contenuto per iniziare.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredArticles.map(article => (
                <ArticleCard key={article.id} article={article} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CMSArticleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        companyId={profile.company_id}
        article={selectedArticle}
        onCompleted={loadArticles}
      />
    </div>
  );
}
