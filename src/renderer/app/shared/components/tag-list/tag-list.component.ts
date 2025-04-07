import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ListComponentBase } from '../../classes/ListComponentBase';
import { TagComponent } from '../tag/tag.component';
import type { SelectOption } from '../select-list/select-list.component';
import type {
  DaisyButtonVariant,
  DaisyButtonColor,
  DaisyButtonShape,
} from '../../constants';

@Component({
  selector: 'tag-list',
  imports: [ReactiveFormsModule, TagComponent, LucideAngularModule],
  templateUrl: './tag-list.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagListComponent extends ListComponentBase<string> {
  public valueChange = output<string[]>();
  public values = input<string[]>([]);
  public inputType = input<'text' | 'select'>('text');
  public readonly variant = input<DaisyButtonVariant>('default');
  public readonly color = input<DaisyButtonColor>('default');
  public readonly shape = input<DaisyButtonShape>('default');
  public readonly options = input<SelectOption[]>([]);
  public readonly placeholder = input<string>('Tag');
  protected readonly displayValues = computed(() => {
    const inputType = this.inputType();
    if (inputType === 'text') {
      return this.values();
    } else {
      const allOptions = this.options();
      const values = this.values();
      return values.map(
        (v) => allOptions.find((o) => o.value === v)?.label ?? v
      );
    }
  });
  protected readonly placeholderOption =
    viewChild<ElementRef<HTMLOptionElement>>('placeholderOption');
  protected readonly availableOptions = computed(() => {
    const allOptions = this.options();
    const values = this.values();
    return allOptions.filter((o) => !values.includes(o.value));
  });
  protected readonly formGroup = new FormGroup({
    tag: new FormControl<string>('', { nonNullable: true }),
  });
  protected handleSubmit(value?: string) {
    const newTag = value ?? this.formGroup.controls.tag.value;
    if (newTag) {
      this.valueChange.emit([...this.values(), newTag]);
      this.formGroup.reset();
      const placeholderOption = this.placeholderOption();
      if (placeholderOption) {
        placeholderOption.nativeElement.selected = true;
      }
    }
  }
}
