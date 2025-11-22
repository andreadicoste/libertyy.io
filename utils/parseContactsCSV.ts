import Papa from 'papaparse';
import { Contact, ContactStage } from 'types/database';
import {
  ImportCounts,
  ImportPreviewRow,
  ParseContactsCSVOptions,
  ParseContactsCSVResult,
} from 'types/import';

const VALID_STAGES: ContactStage[] = ['da contattare', 'contattato', 'negoziazione', 'acquisito', 'perso'];

const initialCounts: ImportCounts = {
  valid: 0,
  duplicate: 0,
  error: 0,
  total: 0,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+().\s-]{6,}$/;

const normalizeEmail = (value: string | null) => (value ? value.trim().toLowerCase() : null);
const normalizePhone = (value: string | null) => (value ? value.replace(/[^0-9]/g, '') : null);

const parseFile = (file: File) =>
  new Promise<Record<string, string>[]>((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          reject(new Error(results.errors[0].message));
          return;
        }
        resolve(results.data);
      },
      error: (error) => reject(error),
    });
  });

const buildExistingSet = (contacts: Contact[], selector: (contact: Contact) => string | null) => {
  const values = new Set<string>();
  contacts.forEach((contact) => {
    const extracted = selector(contact);
    if (extracted) {
      values.add(extracted);
    }
  });
  return values;
};

export async function parseContactsCSV({
  file,
  companyId,
  existingContacts,
}: ParseContactsCSVOptions): Promise<ParseContactsCSVResult> {
  const rawRows = await parseFile(file);
  const now = new Date().toISOString();

  const existingEmails = buildExistingSet(existingContacts, (contact) => normalizeEmail(contact.email));
  const existingPhones = buildExistingSet(existingContacts, (contact) => normalizePhone(contact.phone));
  const fileEmails = new Set<string>();
  const filePhones = new Set<string>();

  const rows: ImportPreviewRow[] = [];

  rawRows.forEach((row) => {
    const trimmed = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : '']),
    ) as Record<string, string>;

    const name = trimmed.name || '';
    const email = trimmed.email || '';
    const phone = trimmed.phone || '';
    const address = trimmed.address || '';
    const notes = trimmed.notes || '';
    const estimateText = trimmed.estimate || '';
    const stageValue = trimmed.stage || '';

    if (!name && !email && !phone && !address && !notes && !estimateText && !stageValue) {
      return;
    }

    const issues: string[] = [];

    if (!name) {
      issues.push('Nome obbligatorio');
    }

    const trimmedEmail = email.trim();
    const normalizedEmail = normalizeEmail(trimmedEmail || null);
    if (normalizedEmail && !emailRegex.test(trimmedEmail)) {
      issues.push('Email non valida');
    }

    const trimmedPhone = phone.trim();
    const normalizedPhone = normalizePhone(trimmedPhone || null);
    if (normalizedPhone && !phoneRegex.test(trimmedPhone)) {
      issues.push('Telefono non valido');
    }

    let estimate: number | null = null;
    if (estimateText) {
      const parsedValue = Number(estimateText.replace(',', '.'));
      if (Number.isNaN(parsedValue)) {
        issues.push('Preventivo non numerico');
      } else {
        estimate = parsedValue;
      }
    }

    let stage: ContactStage = 'da contattare';
    if (stageValue) {
      const normalizedStage = stageValue.toLowerCase();
      const foundStage = VALID_STAGES.find((allowedStage) => allowedStage.toLowerCase() === normalizedStage);
      if (foundStage) {
        stage = foundStage;
      } else {
        issues.push('Stage non valido');
      }
    }

    let duplicateField: 'email' | 'phone' | undefined;
    let isDuplicate = false;
    if (issues.length === 0) {
      if (normalizedEmail && (existingEmails.has(normalizedEmail) || fileEmails.has(normalizedEmail))) {
        duplicateField = 'email';
        isDuplicate = true;
        issues.push('Email già presente');
      } else if (normalizedPhone && (existingPhones.has(normalizedPhone) || filePhones.has(normalizedPhone))) {
        duplicateField = 'phone';
        isDuplicate = true;
        issues.push('Telefono già presente');
      }
    }

    if (normalizedEmail) {
      fileEmails.add(normalizedEmail);
    }
    if (normalizedPhone) {
      filePhones.add(normalizedPhone);
    }

    const status: ImportPreviewRow['status'] = issues.length === 0 ? 'valid' : isDuplicate ? 'duplicate' : 'error';

    rows.push({
      id: rows.length + 1,
      payload: {
        company_id: companyId,
        name,
        email: trimmedEmail ? trimmedEmail : null,
        phone: trimmedPhone ? trimmedPhone : null,
        address: address ? address : null,
        notes: notes ? notes : null,
        estimate,
        stage,
        source: 'import_csv',
        created_at: now,
      },
      status,
      issues,
      duplicateField,
    });
  });

  const counts = rows.reduce(
    (acc, row) => {
      acc[row.status] += 1;
      acc.total += 1;
      return acc;
    },
    { ...initialCounts },
  );

  return { rows, counts };
}
