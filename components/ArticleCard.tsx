import { Article } from 'types/database';
import { Calendar, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

interface ArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const fallbackImage =
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80';

export function ArticleCard({ article, onEdit }: ArticleCardProps) {
  const statusClasses =
    article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-700';

  const tags = Array.isArray(article.tags) ? article.tags.slice(0, 3) : [];

  return (
    <button
      type="button"
      onClick={() => onEdit(article)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
        <Image
          src={article.cover_image || fallbackImage}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <p className="line-clamp-2 text-lg font-semibold text-neutral-900">{article.title}</p>
          {article.excerpt ? (
            <p className="line-clamp-2 text-sm text-neutral-600">{article.excerpt}</p>
          ) : (
            <p className="text-sm text-neutral-400">Nessun estratto</p>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-2 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <span>{formatDate(article.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-neutral-400" />
            <span className="truncate">sito.it/{article.slug}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusClasses}`}>
            {article.status === 'published' ? 'Pubblicato' : 'Bozza'}
          </span>
        </div>
      </div>
    </button>
  );
}
