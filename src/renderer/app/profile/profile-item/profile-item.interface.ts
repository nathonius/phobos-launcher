import type { LucideIcon } from '@lucide/angular';
import type { Profile } from '../../../../shared/config';

export interface ProfileItemAction {
  label: string;
  name: string;
  icon: LucideIcon;
}

export type ProfileItem = Profile & {
  actions: ProfileItemAction[];
  statuses: { name: string; icon: LucideIcon }[];
};

export interface ProfileItemEvent {
  item: ProfileItem;
  action: string;
}
