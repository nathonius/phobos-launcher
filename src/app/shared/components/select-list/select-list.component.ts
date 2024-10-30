/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
  LucideAngularModule,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
} from 'lucide-angular';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'select-list',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './select-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectListComponent {
  public readonly valueChange = output<string[]>();
  public readonly removable = input(true, { transform: booleanAttribute });
  public readonly reorder = input(true, { transform: booleanAttribute });
  public readonly values = input.required<string[]>();
  public readonly options = input.required<SelectOption[]>();
  protected readonly availableOptions = computed(() => {
    const allOptions = this.options();
    const values = this.values();
    return allOptions.filter((o) => !values.includes(o.value));
  });
  protected readonly displayValues = computed(() => {
    const allOptions = this.options();
    const values = this.values();
    return values.map((v) => allOptions.find((o) => o.value === v)?.label ?? v);
  });
  protected readonly icons = {
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    PlusIcon,
  };

  handleAdd(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const newValues = [...this.values(), value];
    this.valueChange.emit(newValues);
  }

  handleRemove(index: number): void {
    const newValues = [...this.values()];
    newValues.splice(index, 1);
    this.valueChange.emit(newValues);
  }

  handleReorderUp(index: number): void {
    if (index !== 0) {
      const newValues = [...this.values()];
      const temp = newValues[index - 1];
      newValues[index - 1] = newValues[index];
      newValues[index] = temp;
      this.valueChange.emit(newValues);
    }
  }

  handleReorderDown(index: number): void {
    const newValues = this.values();
    if (index !== newValues.length - 1) {
      const temp = newValues[index + 1];
      newValues[index + 1] = newValues[index];
      newValues[index] = temp;
      this.valueChange.emit(newValues);
    }
  }
}
