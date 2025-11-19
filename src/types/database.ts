export interface Company {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  company_id: string | null;
  role: string;
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
