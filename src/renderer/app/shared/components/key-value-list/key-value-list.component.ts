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
import { v4 as uuid } from 'uuid';

import { LucideAngularModule } from 'lucide-angular';
import { NgClass, NgStyle } from '@angular/common';
import { FileInputComponent } from '../file-input/file-input.component';
import { ListComponentBase } from '../../classes/ListComponentBase';

let radioNumber = 0;

@Component({
  selector: 'key-value-list',
  imports: [
    LucideAngularModule,
    FileInputComponent,
    ReactiveFormsModule,
    NgClass,
    NgStyle,
  ],
  templateUrl: './key-value-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyValueListComponent<T> extends ListComponentBase<T> {
  public readonly valueChange = output<T[]>();
  public readonly valueSelected = output<T>();
  public readonly values = input.required<T[]>();
  public readonly selectable = input(false, { transform: booleanAttribute });
  public readonly removable = input(true, { transform: booleanAttribute });
  public readonly reorder = input(true, { transform: booleanAttribute });
  public readonly withId = input(true, { transform: booleanAttribute });
  public readonly key = input('key');
  public readonly keyPlaceholder = input('Key');
  public readonly keyLabel = input('Key');
  public readonly keyMono = input(true, { transform: booleanAttribute });
  public readonly keyColumnWidth = input('20%');
  public readonly valueMono = input(true, { transform: booleanAttribute });
  public readonly value = input('value');
  public readonly valuePlaceholder = input('Value');
  public readonly valueLabel = input('Value');
  public readonly valueType = input<'text' | 'file'>('text');
  public readonly addLabel = input.required<string>();
  protected readonly templateValues = computed(
    () => this.values() as Record<string, string>[]
  );
  protected readonly radioName = `key-value-list-radio-${radioNumber++}`;

  handleSelect(index: number): void {
    const value = this.values()[index];
    this.valueSelected.emit(value);
  }

  handleAdd(): void {
    const newValues: Record<string, string>[] = [
      ...(this.values() as Record<string, string>[]),
    ];
    const newValue = { [this.key()]: '', [this.value()]: '' };
    if (this.withId()) {
      newValue['id'] = uuid();
    }
    newValues.push(newValue);
    this.valueChange.emit(newValues as T[]);
  }

  handleValueChange(index: number, value: string): void {
    const pair = this.values()[index] as Record<string, string>;
    pair[this.value()] = value;
    this.handleChange(index, pair as T);
  }

  handleKeyChange(index: number, value: string): void {
    const pair = this.values()[index] as Record<string, string>;
    pair[this.key()] = value;
    this.handleChange(index, pair as T);
  }
}
