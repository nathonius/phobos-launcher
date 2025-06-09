import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NgClass, NgStyle } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {} from '@angular/cdk/observers';
import { FitTextDirective } from '../../../shared/directives/fit-text.directive';
import type { ProfileItem, ProfileItemEvent } from '../profile-item.interface';
import { BACKGROUND_TEXTURES } from '../../../shared/images/background-textures/background-textures';
import { GamepadListenerDirective } from '../../../shared/directives/gamepad-listener.directive';
import { rotate } from '../../../shared/functions/rotate';

const ITEM_MIN_WIDTH = 230;
const ITEM_MAX_HEIGHT = 200;

@Component({
  selector: 'profile-item-grid',
  imports: [
    LucideAngularModule,
    FitTextDirective,
    NgStyle,
    ScrollingModule,
    GamepadListenerDirective,
    NgClass,
  ],
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
  protected readonly itemsPerRow = signal<number>(1);
  protected readonly itemSize = computed(() =>
    Math.floor(ITEM_MAX_HEIGHT / this.itemsPerRow())
  );
  protected readonly activeItem = linkedSignal<ProfileItem | null>(() => {
    this.items();
    return null;
  });
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

  protected selectPrevious(delta = 1) {
    const items = this.items();
    if (items.length === 0) {
      this.activeItem.set(null);
      return;
    }
    const active = this.activeItem();
    if (active === null) {
      this.activeItem.set(items[items.length - 1]);
    } else {
      const index = items.findIndex((i) => i.id === active.id);
      const rotated = rotate(items, delta, true);
      this.activeItem.set(rotated[index]);
    }
  }

  protected selectNext(delta = 1) {
    const items = this.items();
    if (items.length === 0) {
      this.activeItem.set(null);
      return;
    }
    const active = this.activeItem();
    if (active === null) {
      this.activeItem.set(items[0]);
    } else {
      const index = items.findIndex((i) => i.id === active.id);
      const rotated = rotate(items, delta, false);
      this.activeItem.set(rotated[index]);
    }
  }

  private updateItemSize() {
    if (this.elRef.nativeElement) {
      const rect = this.elRef.nativeElement.getBoundingClientRect();
      this.itemsPerRow.set(Math.max(1, Math.ceil(rect.width / ITEM_MIN_WIDTH)));
    }
  }
}
