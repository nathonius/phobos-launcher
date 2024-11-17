import { computed, effect, Injectable, signal } from '@angular/core';
import type { LucideIconData } from 'lucide-angular/icons/types';

export interface NavItem {
  label: string;
  icon: LucideIconData;
  callback: (event: MouseEvent) => unknown;
  style?: 'primary' | 'secondary' | 'accent' | 'success';
}

type NavCallback = { cb: () => unknown; label: string };
interface NavCallbacks {
  save: NavCallback | null;
  delete: NavCallback | null;
  edit: NavCallback | null;
  new: NavCallback | null;
  launch: NavCallback | null;
  reset: NavCallback | null;
}
const EMPTY_NAV: NavCallbacks = {
  save: null,
  delete: null,
  edit: null,
  new: null,
  launch: null,
  reset: null,
};

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  public readonly callbacks = computed(() => this._callbacks());
  public saved = signal<boolean>(false);
  public unsavedChanges = signal<boolean>(false);
  private readonly _callbacks = signal<NavCallbacks>(EMPTY_NAV);
  private saveTimeout: number | undefined;

  public constructor() {
    effect(
      () => {
        const saved = this.saved();
        if (saved) {
          window.clearTimeout(this.saveTimeout);
          this.saveTimeout = window.setTimeout(() => {
            this.saved.set(false);
          }, 2000);
        }
      },
      { allowSignalWrites: false }
    );
  }

  public clear() {
    window.clearTimeout(this.saveTimeout);
    this.saved.set(false);
    this.unsavedChanges.set(false);
    this._callbacks.set(EMPTY_NAV);
  }

  public setCallbacks(config: Partial<NavCallbacks>) {
    window.clearTimeout(this.saveTimeout);
    this.saved.set(false);
    this.unsavedChanges.set(false);
    this._callbacks.set({
      save: config.save
        ? {
            cb: this.handleSave(config.save).bind(this),
            label: config.save.label,
          }
        : null,
      delete: config.delete ?? null,
      edit: config.edit ?? null,
      new: config.new ?? null,
      launch: config.launch ?? null,
      reset: config.reset ?? null,
    });
  }

  private handleSave(save: NavCallback) {
    return () => {
      this.saved.set(true);
      save.cb();
      this.unsavedChanges.set(false);
    };
  }
}
