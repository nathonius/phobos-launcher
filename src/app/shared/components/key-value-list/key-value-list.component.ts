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
import { FileInputComponent } from '../file-input/file-input.component';

@Component({
  selector: 'key-value-list',
  standalone: true,
  imports: [LucideAngularModule, FileInputComponent, ReactiveFormsModule],
  templateUrl: './key-value-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyValueListComponent<T extends Record<string, string>> {
  public readonly remove = output<number>();
  public readonly valueChange = output<T[]>();
  public readonly values = input.required<T[]>();
  public readonly removable = input(true, { transform: booleanAttribute });
  public readonly reorder = input(true, { transform: booleanAttribute });
  public readonly key = input('key');
  public readonly keyPlaceholder = input('Key');
  public readonly value = input('value');
  public readonly valuePlaceholder = input('Value');
  protected readonly templateValues = computed(
    () => this.values() as Record<string, string>[]
  );
  protected readonly icons = {
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    PlusIcon,
  };

  handleChange(values: Record<string, string>[]): void {
    this.valueChange.emit(values as T[]);
  }

  handleAdd(): void {
    const newValues: Record<string, string>[] = [...this.values()];
    newValues.push({ [this.key()]: '', [this.value()]: '' });
    this.handleChange(newValues);
  }

  handleValueChange(index: number, value: string): void {
    this.updatePair(index, value, this.value());
  }

  handleKeyChange(index: number, value: string): void {
    this.updatePair(index, value, this.key());
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

  private updatePair(index: number, value: string, accessor: string): void {
    const newValues = [...this.values()];
    (newValues as Record<string, string>[])[index][accessor] = value;
    this.handleChange(newValues);
  }
}
