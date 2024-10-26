import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Api } from '../../api/api';

export type ValidTheme = 'retro' | 'synthwave';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public readonly theme = computed(() => this._theme());
  private readonly doc = inject(DOCUMENT);
  private readonly _theme = signal<ValidTheme | null>(null);

  constructor() {
    Api['settings.get']('theme').then((themeSetting) => {
      const theme = (themeSetting ?? null) as ValidTheme | null;
      this.setTheme(theme);
    });
  }

  public setTheme(theme: ValidTheme | null) {
    this.doSetTheme(theme);
    this._theme.set(theme);
    void Api['settings.set']('theme', theme);
  }

  private doSetTheme(value: string | null) {
    const root = this.doc.querySelector('html');
    if (root && value === null) {
      delete root.dataset['theme'];
    } else if (root && value !== null) {
      root.dataset['theme'] = value;
    }
  }
}
