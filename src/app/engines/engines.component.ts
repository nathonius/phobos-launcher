import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
} from '@angular/core';
import type { Engine } from '@shared/config';
import type { JSONValue } from '@shared/json';
import { Api } from '../api/api';
import { KeyValueListComponent } from '../shared/components/key-value-list/key-value-list.component';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';

@Component({
  selector: 'app-engines',
  standalone: true,
  imports: [KeyValueListComponent, FormSectionComponent],
  templateUrl: './engines.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnginesComponent {
  public readonly engines = signal<Engine[]>([]);
  constructor() {
    effect(
      async () => {
        const engines = ((await Api['settings.get']('engines')) ??
          []) as Engine[];
        this.engines.set(engines);
      },
      { allowSignalWrites: true }
    );
  }

  async handleChange(value: Engine[]) {
    await Api['settings.set']('engines', value as unknown as JSONValue);
    this.engines.set(value);
  }
}
