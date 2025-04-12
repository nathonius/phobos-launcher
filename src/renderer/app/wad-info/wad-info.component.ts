import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  linkedSignal,
} from '@angular/core';
import { Api } from '../api/api';
import type { WadInfo } from '../../../shared/lib/wad';

@Component({
  selector: 'wad-info',
  imports: [],
  templateUrl: './wad-info.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WadInfoComponent {
  public readonly wadPath = input<string>('');
  protected readonly wadInfo = linkedSignal<WadInfo | null>(() => {
    this.wadPath();
    return null;
  });

  public constructor() {
    effect(async () => {
      const path = this.wadPath();
      const info = await Api['wad.getInfo'](path);
      this.wadInfo.set(info);
    });
  }
}
