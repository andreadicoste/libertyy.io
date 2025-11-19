import { Contact, ContactStage } from '@/types/database';

export type ImportContactStatus = 'valid' | 'duplicate' | 'error';

export interface ImportContactPayload {
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  estimate: number | null;
  stage: ContactStage;
  source: string;
  created_at: string;
}

export interface ImportPreviewRow {
  id: number;
  payload: ImportContactPayload;
  status: ImportContactStatus;
  issues: string[];
  duplicateField?: 'email' | 'phone';
}

export interface ImportCounts {
  valid: number;
  duplicate: number;
  error: number;
  total: number;
}

export interface ParseContactsCSVOptions {
  file: File;
  companyId: string;
  existingContacts: Contact[];
}

export interface ParseContactsCSVResult {
  rows: ImportPreviewRow[];
  counts: ImportCounts;
}
