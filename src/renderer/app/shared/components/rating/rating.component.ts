import { NgTemplateOutlet } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'rating',
  imports: [LucideAngularModule, FormsModule, NgTemplateOutlet],
  templateUrl: './rating.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingComponent {
  public readonly radioName = input.required<string>();
  public readonly radioIcon = input.required<TemplateRef<any>>();
  public readonly value = input<number | null>(null);
  public readonly _value = linkedSignal<number | null>(() => this.value());
  public readonly valueChange = output<number | null>();

  constructor() {
    effect(() => {
      this.valueChange.emit(this._value());
    });
  }
}
