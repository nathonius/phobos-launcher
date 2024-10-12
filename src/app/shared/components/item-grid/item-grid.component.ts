import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { LucideIconData } from 'lucide-angular/icons/types';
import { AsyncPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

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
  imports: [AsyncPipe, LucideAngularModule],
  templateUrl: './item-grid.component.html',
  styleUrl: './item-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemGridComponent {
  public readonly action = output<GridItemEvent>();
  public readonly items = input.required<GridItem[]>();
}
