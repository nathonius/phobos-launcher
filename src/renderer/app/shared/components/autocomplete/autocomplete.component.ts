import type { TemplateRef, ElementRef } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CdkListboxModule } from '@angular/cdk/listbox';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import type { LucideIconData } from 'lucide-angular/src/icons/icons/types';
import { LucideAngularModule } from 'lucide-angular';

let idCount = 0;

@Component({
  selector: 'app-autocomplete',
  imports: [CdkListboxModule, NgClass, NgTemplateOutlet, LucideAngularModule],
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
  public readonly autofocusInput = input(false, {
    transform: booleanAttribute,
  });
  public readonly placeholder = input('');
  public readonly options = input.required<T[]>();
  public readonly inputId = input<string>();
  public readonly icon = input<LucideIconData>();
  public readonly labelKey = input('label');
  public readonly valueChange = output<T | null>();
  public readonly query = output<string>();
  public readonly loading = input<boolean>(false);
  public readonly itemTemplate = input<TemplateRef<unknown>>();
  public readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  protected readonly queryInput =
    viewChild<ElementRef<HTMLInputElement>>('queryInput');
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

  setQuery(value: string): void {
    const queryInput = this.queryInput()?.nativeElement;
    if (queryInput) {
      queryInput.value = value;
    }
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
