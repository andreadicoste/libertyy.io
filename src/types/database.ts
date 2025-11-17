export interface Company {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  company_id: string | null;
  role: string;
}

export interface Contact {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  stage: 'da contattare' | 'contattato' | 'negoziazione' | 'acquisito' | 'perso';
  created_at: string;
}
