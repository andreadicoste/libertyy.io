import { ContactStage } from '@/types/database';

export interface ContactFilters {
  stages: ContactStage[];
  hasEmail: 'all' | 'yes' | 'no';
  hasPhone: 'all' | 'yes' | 'no';
  createdFrom: string;
  createdTo: string;
}
