import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NgStyle } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {} from '@angular/cdk/observers';
import { FitTextDirective } from '../../../shared/directives/fit-text.directive';
import type { ProfileItem, ProfileItemEvent } from '../profile-item.interface';
import { BACKGROUND_TEXTURES } from '../../../shared/images/background-textures/background-textures';

const ITEM_MIN_WIDTH = 230;
const ITEM_MAX_HEIGHT = 200;

@Component({
  selector: 'profile-item-grid',
  imports: [LucideAngularModule, FitTextDirective, NgStyle, ScrollingModule],
  templateUrl: './profile-item-grid.component.html',
  styleUrl: './profile-item-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full overflow-y-auto overflow-x-hidden pr-2',
  },
})
export class ProfileItemGridComponent implements OnInit {
  public readonly action = output<ProfileItemEvent>();
  public readonly items = input.required<ProfileItem[]>();
  protected readonly backgrounds = Object.fromEntries(
    Object.entries(BACKGROUND_TEXTURES).map(([k, v]) => {
      return [k, `url(${v})`];
    })
  );
  protected readonly itemSize = signal<number>(200);
  private readonly elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly resizeObserver: ResizeObserver;

  constructor() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateItemSize();
    });
  }

  public ngOnInit(): void {
    this.updateItemSize();
    this.resizeObserver.observe(this.elRef.nativeElement);
  }

  private updateItemSize() {
    if (this.elRef.nativeElement) {
      const rect = this.elRef.nativeElement.getBoundingClientRect();
      const itemsPerRow = Math.max(1, Math.ceil(rect.width / ITEM_MIN_WIDTH));
      this.itemSize.set(Math.floor(ITEM_MAX_HEIGHT / itemsPerRow));
    }
  }
}
