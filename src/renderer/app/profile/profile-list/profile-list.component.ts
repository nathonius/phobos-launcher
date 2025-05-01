import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LucideAngularModule, Search, SortAsc, SortDesc } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import type {
  ProfileItemEvent,
  ProfileItem,
} from '../profile-item/profile-item.interface';

import { ProfileItemGridComponent } from '../profile-item/profile-item-grid/profile-item-grid.component';
import { CategoryService } from '../../category/category.service';
import { ProfileService } from '../profile.service';
import { toSorted } from '../../shared/functions/toSorted';
import type { Profile } from '../../../../shared/config';
import { Api } from '../../api/api';
import { ViewService } from '../../shared/services/view.service';
import { HomeViewState } from '../../shared/constants';

export type ProfileSort =
  | 'alphabetical'
  | 'date_added'
  | 'last_played'
  | 'rating';
export const VALID_SORT_ARRAY: ProfileSort[] = [
  'alphabetical',
  'date_added',
  'last_played',
  'rating',
];

@Component({
  selector: 'profile-list',
  imports: [LucideAngularModule, FormsModule, ProfileItemGridComponent],
  templateUrl: './profile-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-4 w-full overflow-hidden p-2',
  },
})
export class ProfileListComponent {
  protected readonly searchQuery = signal<string>('');
  protected readonly sort = signal<null | ProfileSort>(null);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly categoryName = computed(
    () => this.categoryService.selectedCategory()?.name ?? 'All'
  );
  protected readonly profileItems = computed(() => {
    const allItems = this.profileService.displayProfiles();
    const selectedCategory = this.categoryService.selectedCategory();
    const sort = this.sort();
    const sortDirection = this.sortDirection() === 'asc' ? 1 : -1;
    const query = this.searchQuery();
    let filtered: ProfileItem[];
    if (selectedCategory === undefined || selectedCategory.id === 'all') {
      filtered = allItems;
    } else {
      filtered = allItems.filter((p) =>
        ((p as unknown as Profile).categories ?? []).includes(
          selectedCategory.id
        )
      );
    }
    if (query) {
      filtered = filtered.filter(
        (profile) =>
          profile.name.toLowerCase().includes(query) ||
          (profile.tags ?? []).some((t) => t.toLowerCase().includes(query))
      );
    }
    if (sort === 'alphabetical') {
      return toSorted(filtered, (a, b) =>
        a.name > b.name ? sortDirection : sortDirection * -1
      );
    } else if (sort === 'last_played') {
      return toSorted(
        filtered,
        (a, b) =>
          (new Date(a.lastPlayed ?? 0).valueOf() -
            new Date(b.lastPlayed ?? 0).valueOf()) *
          sortDirection
      );
    } else if (sort === 'date_added') {
      return toSorted(
        filtered,
        (a, b) =>
          (new Date(a.created ?? 0).valueOf() -
            new Date(b.created ?? 0).valueOf()) *
          sortDirection
      );
    } else if (sort === 'rating') {
      return toSorted(filtered, (a, b) => {
        if (typeof a.rating !== 'number') {
          return 1;
        }
        if (typeof b.rating !== 'number') {
          return -1;
        }
        const result = a.rating > b.rating ? 1 : 0;
        return result * sortDirection;
      });
    } else {
      return filtered;
    }
  });
  protected readonly icons = {
    Search,
    SortAsc,
    SortDesc,
  };
  protected readonly profileService = inject(ProfileService);
  protected readonly categoryService = inject(CategoryService);
  private readonly viewService = inject(ViewService);

  public constructor() {
    Api['settings.get']('home.sort').then((v) => {
      if (
        typeof v === 'string' &&
        VALID_SORT_ARRAY.includes(v as ProfileSort)
      ) {
        this.sort.set(v as ProfileSort);
      }
    });
    Api['settings.get']('home.sortDirection').then((v) => {
      if (typeof v === 'string' && ['asc', 'desc'].includes(v)) {
        this.sortDirection.set(v as 'asc' | 'desc');
      }
    });
  }

  protected handleSort(event: ProfileSort) {
    this.sort.set(event);
    Api['settings.set']('home.sort', event);
  }

  protected handleSortDirectionChange(event: 'asc' | 'desc') {
    this.sortDirection.set(event);
    Api['settings.set']('home.sortDirection', event);
  }

  protected handleAction(event: ProfileItemEvent) {
    const profile = this.profileService
      .allProfiles()
      .find((p) => p.name === event.item.name);
    if (event.action === 'primary' || event.action === 'edit') {
      this.profileService.selectedProfile.set(profile);
      this.viewService.homeState.set(HomeViewState.ProfileEdit);
    } else if (event.action === 'delete' && profile) {
      this.profileService.deleteProfile(profile);
    } else if (event.action === 'launch' && profile) {
      this.profileService.launch(profile);
    }
  }
}
