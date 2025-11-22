import { Contact } from 'types/database';

const CSV_COLUMNS: Array<keyof Contact> = [
  'name',
  'phone',
  'email',
  'address',
  'stage',
  'source',
  'estimate',
  'notes',
  'created_at',
];

const sanitize = (value: unknown) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).replace(/"/g, '""');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue}"`;
  }
  return stringValue;
};

export function exportContactsToCSV(contacts: Contact[]) {
  const header = CSV_COLUMNS.join(',');
  const rows = contacts.map(contact =>
    CSV_COLUMNS
      .map(column => {
        const value = (contact as unknown as Record<string, unknown>)[column] ?? '';
        return sanitize(value);
      })
      .join(','),
  );

  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateString = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `contacts-export-${dateString}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
