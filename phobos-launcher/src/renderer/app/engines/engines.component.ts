import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { LucideAngularModule, Plus, Trash } from 'lucide-angular';
import { v4 as uuid } from 'uuid';
import type { Engine } from '../../../shared/config';
import { Api } from '../api/api';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import { NavbarService } from '../shared/services/navbar.service';

@Component({
  selector: 'app-engines',
  imports: [FormSectionComponent, FileInputComponent, LucideAngularModule],
  templateUrl: './engines.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnginesComponent {
  public readonly engines = signal<Engine[]>([]);
  public readonly icons = {
    Plus,
    Trash,
  };
  private readonly navbarService = inject(NavbarService);
  constructor() {
    this.navbarService.setCallbacks({});
    effect(
      async () => {
        const engines = await Api['engine.getEngines']();
        this.engines.set(engines);
      },
      { allowSignalWrites: true }
    );
  }

  async handleDelete(id: string) {
    await Api['engine.delete'](id);
    const newEngines = await Api['engine.getEngines']();
    this.engines.set(newEngines);
  }

  handleNewEngine() {
    const newEngine: Engine = {
      id: uuid(),
      config: '',
      name: '',
      path: '',
    };
    this.handleChange(newEngine);
  }

  handleNameChange(name: string, id: string) {
    const engine = this.engines().find((e) => e.id === id);
    if (engine) {
      engine.name = name;
      this.handleChange(engine);
    }
  }

  handlePathChange(path: string, id: string) {
    const engine = this.engines().find((e) => e.id === id);
    if (engine) {
      engine.path = path;
      this.handleChange(engine);
    }
  }

  handleConfigChange(config: string, id: string) {
    const engine = this.engines().find((e) => e.id === id);
    if (engine) {
      engine.config = config;
      this.handleChange(engine);
    }
  }

  async handleChange(value: Engine) {
    await Api['engine.save'](value);
    const newEngines = await Api['engine.getEngines']();
    this.engines.set(newEngines);
  }
}
