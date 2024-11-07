/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElementRef } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { LucideAngularModule } from 'lucide-angular';
import { ListComponentBase } from '../../classes/ListComponentBase';

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
export class SelectListComponent extends ListComponentBase {
  public readonly valueChange = output<string[]>();
  public readonly removable = input(true, { transform: booleanAttribute });
  public readonly reorder = input(true, { transform: booleanAttribute });
  public readonly values = input.required<string[]>();
  public readonly options = input.required<SelectOption[]>();
  public readonly placeholderOption = input.required<string>();
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
  protected readonly placeholder =
    viewChild<ElementRef<HTMLOptionElement>>('placeholder');

  handleAdd(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    const newValues = [...this.values(), value];
    this.valueChange.emit(newValues);
    const placeholder = this.placeholder();
    if (placeholder) {
      placeholder.nativeElement.selected = true;
    }
  }
}
