import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import type { UniqueFileRecord } from '../../../shared/config';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { Api } from '../api/api';
import { KeyValueListComponent } from '../shared/components/key-value-list/key-value-list.component';
import { NavbarService } from '../shared/services/navbar.service';

type DisplayBase = UniqueFileRecord & {
  fileExists: boolean;
};

@Component({
  selector: 'app-bases',
  imports: [KeyValueListComponent, FormSectionComponent],
  templateUrl: './bases.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasesComponent {
  public readonly baseWads = signal<UniqueFileRecord[]>([]);
  public readonly displayBases = signal<DisplayBase[]>([]);
  private readonly navbarService = inject(NavbarService);
  constructor() {
    this.navbarService.setCallbacks({});
    effect(async () => {
      const bases = (await Api['settings.get']('bases')) ?? [];
      this.baseWads.set(bases);
    });
    effect(async () => {
      const displayBases: DisplayBase[] = [];
      const bases = this.baseWads();
      for (const base of bases) {
        const fileExists = await Api['fileSystem.fileExists'](base.path);
        displayBases.push({ ...base, fileExists });
      }
      this.displayBases.set(displayBases);
    });
  }

  async handleChange(value: UniqueFileRecord[]) {
    await Api['settings.set']('bases', value);
    this.baseWads.set(value);
  }

  rowHasError(base: DisplayBase) {
    return !base.fileExists;
  }
}
