import { ContactStage } from 'types/database';

export const STAGE_COLORS: Record<ContactStage, { bg: string; text: string; border: string; solid?: string }> = {
  'da contattare': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    solid: 'bg-blue-500',
  },
  contattato: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    solid: 'bg-amber-500',
  },
  negoziazione: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    solid: 'bg-purple-500',
  },
  acquisito: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    solid: 'bg-green-500',
  },
  perso: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    solid: 'bg-red-500',
  },
};

export const STAGE_LABELS: Record<ContactStage, string> = {
  'da contattare': 'Da Contattare',
  contattato: 'Contattato',
  negoziazione: 'Negoziazione',
  acquisito: 'Acquisito',
  perso: 'Perso',
};

export const STAGES: ContactStage[] = [
  'da contattare',
  'contattato',
  'negoziazione',
  'acquisito',
  'perso',
];
