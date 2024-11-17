import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { LucideIconData } from 'lucide-angular/icons/types';
import { LucideAngularModule } from 'lucide-angular';
import { FitTextDirective } from '../../directives/fit-text.directive';

export interface GridItemAction {
  label: string;
  name: string;
  icon: LucideIconData;
}

export interface GridItem {
  name: string;
  img: string;
  actions: GridItemAction[];
}

export interface GridItemEvent {
  item: GridItem;
  action: string;
}

@Component({
  selector: 'item-grid',
  standalone: true,
  imports: [LucideAngularModule, FitTextDirective],
  templateUrl: './item-grid.component.html',
  styleUrl: './item-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full overflow-y-auto',
  },
})
export class ItemGridComponent {
  public readonly action = output<GridItemEvent>();
  public readonly items = input.required<GridItem[]>();
}
