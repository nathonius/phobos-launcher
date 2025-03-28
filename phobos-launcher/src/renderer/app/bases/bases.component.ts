import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import type { UniqueFileRecord } from '../../../shared/config';
import type { JSONValue } from '../../../shared/json';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { Api } from '../api/api';
import { KeyValueListComponent } from '../shared/components/key-value-list/key-value-list.component';
import { NavbarService } from '../shared/services/navbar.service';

@Component({
  selector: 'app-bases',
  imports: [KeyValueListComponent, FormSectionComponent],
  templateUrl: './bases.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasesComponent {
  public readonly baseWads = signal<UniqueFileRecord[]>([]);
  private readonly navbarService = inject(NavbarService);
  constructor() {
    this.navbarService.setCallbacks({});
    effect(
      async () => {
        const bases = ((await Api['settings.get']('bases')) ??
          []) as UniqueFileRecord[];
        this.baseWads.set(bases);
      },
      { allowSignalWrites: true }
    );
  }

  async handleChange(value: UniqueFileRecord[]) {
    await Api['settings.set']('bases', value as unknown as JSONValue);
    this.baseWads.set(value);
  }
}
