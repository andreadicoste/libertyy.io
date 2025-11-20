import { ContactStage } from '@/types/database';

export interface StageConfig {
  id: ContactStage;
  title: string;
  badgeClass: string;
  colorClass: string;
}

export const STAGES: StageConfig[] = [
  {
    id: 'da contattare',
    title: 'Da Contattare',
    badgeClass: 'bg-sky-100 text-sky-700 hover:bg-sky-100',
    colorClass: 'bg-sky-500',
  },
  {
    id: 'contattato',
    title: 'Contattato',
    badgeClass: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    colorClass: 'bg-amber-500',
  },
  {
    id: 'negoziazione',
    title: 'Negoziazione',
    badgeClass: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    colorClass: 'bg-purple-500',
  },
  {
    id: 'acquisito',
    title: 'Acquisito',
    badgeClass: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    colorClass: 'bg-emerald-500',
  },
  {
    id: 'perso',
    title: 'Perso',
    badgeClass: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
    colorClass: 'bg-rose-500',
  },
];

export const STAGE_LABELS: Record<ContactStage, string> = STAGES.reduce(
  (acc, stage) => {
    acc[stage.id] = stage.title;
    return acc;
  },
  {} as Record<ContactStage, string>,
);

export const STAGE_BADGE_CLASSES: Record<ContactStage, string> = STAGES.reduce(
  (acc, stage) => {
    acc[stage.id] = stage.badgeClass;
    return acc;
  },
  {} as Record<ContactStage, string>,
);

export const STAGE_COLOR_CLASSES: Record<ContactStage, string> = STAGES.reduce(
  (acc, stage) => {
    acc[stage.id] = stage.colorClass;
    return acc;
  },
  {} as Record<ContactStage, string>,
);
