import type { TemplateRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { CdkListboxModule } from '@angular/cdk/listbox';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { NgClass, NgTemplateOutlet } from '@angular/common';

let idCount = 0;

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CdkListboxModule, NgClass, NgTemplateOutlet],
  templateUrl: './autocomplete.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
  host: {
    class: 'flex flex-col w-full gap-2 items-center',
  },
})
export class AutocompleteComponent<T> implements ControlValueAccessor {
  public readonly options = input.required<T[]>();
  public readonly inputId = input<string>();
  public readonly labelKey = input('label');
  public readonly valueChange = output<T | null>();
  public readonly query = output<string>();
  public readonly loading = input<boolean>(false);
  public readonly itemTemplate = input<TemplateRef<unknown>>();
  public readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  protected readonly value = signal<T | null>(null);
  protected readonly listboxValue = computed(() => {
    const value = this.value();
    if (value === null) {
      return [];
    }
    return [value];
  });
  protected readonly isDisabled = signal<boolean>(false);
  protected onChange: (value: T | null) => void = () => {
    // pass
  };
  protected onTouch: () => void = () => {
    // pass
  };
  protected readonly autocompleteTargetId = `autocomplete-target-${++idCount}`;

  constructor() {
    effect(() => {
      const value = this.value();
      this.onChange(value);
      this.valueChange.emit(value);
    });
  }

  writeValue(value: unknown): void {
    if (!value) {
      this.value.set(null);
    } else {
      this.value.set(value as T);
    }
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
