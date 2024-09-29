import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import type { Category } from '@shared/config';
import { Api } from '../../api/categories';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  protected readonly categories = signal<Category[]>([]);
  constructor() {
    effect(
      async () => {
        this.categories.set(await Api['category.getCategoryList']());
      },
      { allowSignalWrites: true }
    );
  }
}
