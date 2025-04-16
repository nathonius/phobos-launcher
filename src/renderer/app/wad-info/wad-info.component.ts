import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { Api } from '../api/api';
import type { WadInfo } from '../../../shared/lib/wad';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'wad-info',
  imports: [],
  templateUrl: './wad-info.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WadInfoComponent {
  public readonly wadPath = input<string>('');
  public readonly saveImage = output<string>();
  protected readonly wadInfo = linkedSignal<WadInfo | null>(() => {
    this.wadPath();
    return null;
  });
  protected readonly graphics = linkedSignal<string[] | null>(() => {
    this.wadPath();
    return null;
  });
  protected readonly displayGraphics = computed(() => {
    const graphics = this.graphics();
    if (!graphics) {
      return [];
    }
    return graphics.map((g) => this.profileService.getProfileIcon(g, false));
  });
  private readonly profileService = inject(ProfileService);

  public constructor() {
    effect(async () => {
      const path = this.wadPath();
      if (!path) {
        return;
      }
      if (!path.endsWith('.wad') && !path.endsWith('.pk3')) {
        console.warn(`Reading non-wad files is not yet supported.`);
        return;
      }
      const info = await Api['wad.getInfo'](path);
      this.wadInfo.set(info);
    });
    effect(async () => {
      this.wadInfo();
      const wadPath = this.wadPath();
      if (!wadPath) {
        this.graphics.set(null);
        return;
      }
      try {
        const displayLumps = [
          'titlepic',
          'interpic',
          'm_doom',
          'credit',
          'bossback',
        ];
        this.graphics.set(await Api['wad.getGraphics'](wadPath, displayLumps));
      } catch (err) {
        console.warn(err);
        this.graphics.set(null);
      }
    });
  }

  protected saveGraphic(index: number) {
    const graphics = this.graphics();
    if (!graphics || !graphics[index]) {
      return;
    }
    this.saveImage.emit(graphics[index]);
  }
}
