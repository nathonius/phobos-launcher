import type { LucideIconData } from 'lucide-angular/icons/types';
import type { Profile } from '@shared/config';

export interface ProfileItemAction {
  label: string;
  name: string;
  icon: LucideIconData;
}

export type ProfileItem = Profile & {
  actions: ProfileItemAction[];
  statuses: { name: string; icon: LucideIconData }[];
};

export interface ProfileItemEvent {
  item: ProfileItem;
  action: string;
}
