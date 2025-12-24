import { computed, inject, Injectable, signal, DOCUMENT } from '@angular/core';
import { Api } from '../../api/api';
import type { AppTheme } from '../../../../shared/config';

export const THEME_MAP: Record<AppTheme, string> = {
  abyss: 'Abyss',
  acid: 'Acid',
  aqua: 'Aqua',
  autumn: 'Autumn',
  black: 'Black',
  bumblebee: 'Bumblebee',
  business: 'Business',
  caramellatte: 'Caramel Latte',
  cmyk: 'cmyk',
  coffee: 'Coffee',
  corporate: 'Corporate',
  cupcake: 'Cupcake',
  cyberpunk: 'Cyberpunk',
  dark: 'Dark',
  dim: 'Dim',
  dracula: 'Dracula',
  emerald: 'Emerald',
  fantasy: 'Fantasy',
  forest: 'Forest',
  garden: 'Garden',
  halloween: 'Halloween',
  lemonade: 'Lemonade',
  light: 'Light',
  lofi: 'lofi',
  luxury: 'Luxury',
  night: 'Night',
  nord: 'Nord',
  pastel: 'Pastel',
  retro: 'Retro',
  silk: 'Silk',
  sunset: 'Sunset',
  synthwave: 'Synthwave',
  valentine: 'Valentine',
  winter: 'Winter',
  wireframe: 'Wireframe',
};

export const DEFAULT_THEME: AppTheme = 'synthwave';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public readonly theme = computed(() => this._theme());
  private readonly doc = inject(DOCUMENT);
  private readonly _theme = signal<AppTheme | null>(null);

  constructor() {
    Api['settings.get']('theme').then((themeSetting) => {
      const theme = themeSetting ?? DEFAULT_THEME;
      this.setTheme(theme);
    });
  }

  public setTheme(theme: AppTheme | null) {
    this.doSetTheme(theme);
    this._theme.set(theme);
    void Api['settings.set']('theme', theme ?? DEFAULT_THEME);
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
