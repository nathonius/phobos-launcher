import type { ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { CdkListboxModule } from '@angular/cdk/listbox';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

type TypeaheadFilter<T> = (query: string, options: T[]) => T[];

/**
 * @deprecated I think this is unused, and it's the same functionality as autocomplete. Theoretically.
 */
@Component({
  selector: 'typeahead',
  imports: [FormsModule, CdkListboxModule],
  templateUrl: './typeahead.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeaheadComponent<T> {
  public readonly options = input.required<T[]>();
  public readonly filter = input.required<TypeaheadFilter<T>>();
  public readonly labelKey = input<keyof T>('label' as keyof T);
  public readonly value = input<T | null | undefined>();
  public readonly placeholder = input<string>();
  public readonly valueChange = output<T>();

  protected readonly query = linkedSignal(() => {
    this.value();
    return '';
  });
  protected readonly _value = linkedSignal(this.value);
  protected readonly filteredOptions = computed(() => {
    const query = this.query();
    const options = this.options();
    const filter = this.filter();
    if (query === '') {
      return options;
    }
    return filter(query, options);
  });

  protected getLabel(value: T): string {
    if (typeof value === 'string') {
      return value;
    } else {
      return value[this.labelKey()] as string;
    }
  }

  protected handleValueChange(event: ListboxValueChangeEvent<T>) {
    const value = event.value[0];
    this._value.set(value);
    this.query.set(this.getLabel(value));
    this.valueChange.emit(value);
  }
}
