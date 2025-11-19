import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Article, ArticleStatus } from '@/types/database';
import { generateUniqueSlug, slugify } from '@/utils/generateSlug';
import { uploadCoverImage } from '@/utils/uploadCoverImage';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { EditorToolbar } from '@/components/EditorToolbar';
import { RichTextEditor } from '@/components/RichTextEditor';
import DOMPurify from 'dompurify';

interface CMSArticleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  article?: Article | null;
  onCompleted: () => void;
}

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  status: ArticleStatus;
  cover_image: string;
};

const defaultFormState: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  tags: '',
  status: 'draft',
  cover_image: '',
};

const parseTags = (value: string) =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

export function CMSArticleModal({ open, onOpenChange, companyId, article, onCompleted }: CMSArticleModalProps) {
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [autoSlug, setAutoSlug] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingArticle, setFetchingArticle] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isEdit = Boolean(article);

  const resetState = useCallback(() => {
    setForm(defaultFormState);
    setAutoSlug(true);
    setCoverFile(null);
    setCoverPreview('');
    setUploadError('');
  }, []);

  const loadArticle = useCallback(async () => {
    if (!article?.id) return;
    setFetchingArticle(true);
    try {
      const { data, error } = await supabase.from('articles').select('*').eq('id', article.id).single();
      if (error) throw error;
      setForm({
        title: data.title ?? '',
        slug: data.slug ?? '',
        excerpt: data.excerpt ?? '',
        content: data.content ?? '',
        tags: data.tags?.join(', ') ?? '',
        status: data.status ?? 'draft',
        cover_image: data.cover_image ?? '',
      });
      setCoverPreview(data.cover_image ?? '');
      setAutoSlug(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante il caricamento';
      toast.error(message);
      onOpenChange(false);
    } finally {
      setFetchingArticle(false);
    }
  }, [article, onOpenChange]);

  useEffect(() => {
    if (open) {
      if (article) {
        loadArticle();
      } else {
        resetState();
      }
    } else {
      resetState();
    }
  }, [open, article, loadArticle, resetState]);

  const handleTitleChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      title: value,
      slug: autoSlug ? slugify(value) : prev.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    setForm(prev => ({ ...prev, slug: value }));
  };

  const handleFileSelect = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Seleziona un file immagine');
      return;
    }
    setUploadError('');
    setCoverFile(file);
    const preview = URL.createObjectURL(file);
    setCoverPreview(preview);
  };

  useEffect(
    () => () => {
      if (coverPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview);
      }
    },
    [coverPreview],
  );

  const handleSubmit = async (targetStatus: ArticleStatus) => {
    if (!form.title.trim()) {
      toast.error('Il titolo è obbligatorio');
      return;
    }

    setLoading(true);
    try {
      const slug = await generateUniqueSlug(form.slug || form.title, companyId, article?.id);
      const cleanContent = DOMPurify.sanitize(form.content || '');
      let coverUrl = form.cover_image;
      if (coverFile) {
        coverUrl = await uploadCoverImage(coverFile, companyId);
      }

      const payload = {
        company_id: companyId,
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        content: cleanContent || null,
        cover_image: coverUrl || null,
        tags: parseTags(form.tags),
        status: targetStatus,
        updated_at: new Date().toISOString(),
      };

      if (isEdit && article) {
        const { error } = await supabase.from('articles').update(payload).eq('id', article.id);
        if (error) throw error;
        toast.success(targetStatus === 'published' ? 'Articolo aggiornato' : 'Bozza aggiornata');
      } else {
        const timestamp = new Date().toISOString();
        const { error } = await supabase
          .from('articles')
          .insert({ ...payload, created_at: timestamp, updated_at: timestamp });
        if (error) throw error;
        toast.success(targetStatus === 'published' ? 'Articolo pubblicato' : 'Bozza salvata');
      }
      setForm(prev => ({ ...prev, status: targetStatus }));
      onCompleted();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante il salvataggio';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    const confirmed = window.confirm('Sei sicuro di voler eliminare questo articolo?');
    if (!confirmed) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from('articles').delete().eq('id', article.id);
      if (error) throw error;
      toast.success('Articolo eliminato');
      onCompleted();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante l’eliminazione';
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const coverLabel = useMemo(
    () => (coverFile ? coverFile.name : form.cover_image ? 'Immagine caricata' : 'Nessun file selezionato'),
    [coverFile, form.cover_image],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden p-0 sm:p-0">
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>{isEdit ? 'Modifica articolo' : 'Nuovo articolo'}</DialogTitle>
          <p className="text-sm text-muted-foreground">Gestisci contenuti per il blog della tua azienda.</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {fetchingArticle ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-5 px-4 pb-6 pt-2 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={event => handleTitleChange(event.target.value)}
                    placeholder="Guida definitiva al CRM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={event => handleSlugChange(event.target.value)}
                    placeholder="guida-definitiva-crm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={event => setForm(prev => ({ ...prev, excerpt: event.target.value }))}
                  placeholder="Introduzione breve dell’articolo..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenuto</Label>
                <EditorToolbar targetRef={contentRef} />
                <RichTextEditor
                  ref={contentRef}
                  value={form.content}
                  onChange={html => setForm(prev => ({ ...prev, content: html }))}
                  placeholder="Scrivi qui l’articolo completo..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tag (separati da virgola)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={event => setForm(prev => ({ ...prev, tags: event.target.value }))}
                    placeholder="crm, marketing, guida"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={value => setForm(prev => ({ ...prev, status: value as ArticleStatus }))}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Seleziona uno status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bozza</SelectItem>
                      <SelectItem value="published">Pubblicato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover image</Label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 overflow-hidden rounded-lg border bg-neutral-100">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Preview</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-fit gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                    >
                      <Upload className="h-4 w-4" />
                      Carica immagine
                    </Button>
                    <p className="text-xs text-muted-foreground">{coverLabel}</p>
                    {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={event => {
                      handleFileSelect(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-neutral-200 px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
          {isEdit ? (
            <Button variant="ghost" type="button" onClick={handleDelete} disabled={deleteLoading || loading}>
              {deleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Elimina
            </Button>
          ) : (
            <div />
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
              Annulla
            </Button>
            <Button type="button" variant="secondary" disabled={loading} onClick={() => handleSubmit('draft')}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salva (bozza)
            </Button>
            <Button type="button" disabled={loading} onClick={() => handleSubmit('published')}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Pubblica
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
