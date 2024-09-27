import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from '../../api/categories';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  protected readonly categories = signal<string[]>([]);
  constructor() {
    effect(
      async () => {
        this.categories.set(await Api['category.getCategoryList']());
      },
      { allowSignalWrites: true }
    );
  }
}
