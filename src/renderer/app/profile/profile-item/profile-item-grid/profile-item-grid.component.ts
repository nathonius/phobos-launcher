import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NgStyle } from '@angular/common';
import { FitTextDirective } from '../../../shared/directives/fit-text.directive';
import type { ProfileItem, ProfileItemEvent } from '../profile-item.interface';
import { BACKGROUND_TEXTURES } from '../../../shared/images/background-textures/background-textures';

@Component({
  selector: 'profile-item-grid',
  imports: [LucideAngularModule, FitTextDirective, NgStyle],
  templateUrl: './profile-item-grid.component.html',
  styleUrl: './profile-item-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full overflow-y-auto overflow-x-hidden pr-2',
  },
})
export class ProfileItemGridComponent {
  public readonly action = output<ProfileItemEvent>();
  public readonly items = input.required<ProfileItem[]>();
  protected readonly backgrounds = Object.fromEntries(
    Object.entries(BACKGROUND_TEXTURES).map(([k, v]) => {
      return [k, `url(${v})`];
    })
  );
}
