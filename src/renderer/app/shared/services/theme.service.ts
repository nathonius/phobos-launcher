import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Api } from '../../api/api';

export type ValidTheme =
  | 'light'
  | 'dark'
  | 'cupcake'
  | 'bumblebee'
  | 'emerald'
  | 'corporate'
  | 'synthwave'
  | 'retro'
  | 'cyberpunk'
  | 'valentine'
  | 'halloween'
  | 'garden'
  | 'forest'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'fantasy'
  | 'wireframe'
  | 'black'
  | 'luxury'
  | 'dracula'
  | 'cmyk'
  | 'autumn'
  | 'business'
  | 'acid'
  | 'lemonade'
  | 'night'
  | 'coffee'
  | 'winter'
  | 'dim'
  | 'nord'
  | 'sunset'
  | 'caramellatte'
  | 'abyss'
  | 'silk';

export const THEME_MAP: Record<ValidTheme, string> = {
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
