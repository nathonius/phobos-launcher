import { Injectable, signal } from '@angular/core';
import type { LucideIconData } from 'lucide-angular/icons/types';

export interface NavItem {
  label: string;
  icon: LucideIconData;
  callback: (event: MouseEvent) => unknown;
  style?: 'primary' | 'secondary' | 'accent';
}

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  public readonly items = signal<NavItem[]>([]);
  public clear() {
    this.items.set([]);
  }
}
