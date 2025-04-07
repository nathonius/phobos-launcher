import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import type { DaisyVariant } from '../../constants';

@Component({
  selector: 'app-tag',
  imports: [NgClass, LucideAngularModule],
  templateUrl: './tag.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  public readonly removable = input(true, {
    transform: booleanAttribute,
  });
  public readonly label = input<string>('');
  public readonly remove = output();
  public readonly variant = input<DaisyVariant>('default');
  protected readonly RemoveIcon = X;
  protected readonly classes = computed(() => {
    const classes: string[] = [];
    const variant = this.variant();
    if (variant !== 'default') {
      classes.push(`btn-${variant}`);
    }
    return classes;
  });
}
