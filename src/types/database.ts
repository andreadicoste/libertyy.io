export interface Company {
  id: string;
  company_name: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  company_id: string | null;
  role: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  email?: string | null;
}

export type ContactStage = 'da contattare' | 'contattato' | 'negoziazione' | 'acquisito' | 'perso';

export interface Contact {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  source: string | null;
  estimate: number | null;
  stage: ContactStage;
  created_at: string;
}

export type ArticleStatus = 'draft' | 'published';

export interface Article {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  tags: string[];
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
}
