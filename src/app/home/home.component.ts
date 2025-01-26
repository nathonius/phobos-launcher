import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, SortAsc, SortDesc } from 'lucide-angular';
import type { Category, Profile } from '@shared/config';
import { ProfileService } from '../profile/profile.service';
import { ProfileComponent } from '../profile/profile.component';
import { CategoryService } from '../category/category.service';
import { CategoryComponent } from '../category/category.component';
import { NavbarService } from '../shared/services/navbar.service';
import { HomeViewState } from '../shared/constants';
import { ViewService } from '../shared/services/view.service';
import { toSorted } from '../shared/functions/toSorted';
import { Api } from '../api/api';
import { ProfileItemGridComponent } from '../profile/profile-item/profile-item-grid/profile-item-grid.component';
import type {
  ProfileItem,
  ProfileItemEvent,
} from '../profile/profile-item/profile-item.interface';

type ProfileSort = 'alphabetical' | 'date_added' | 'last_played';
const VALID_SORT_ARRAY: ProfileSort[] = [
  'alphabetical',
  'date_added',
  'last_played',
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    ReactiveFormsModule,
    ProfileItemGridComponent,
    ProfileComponent,
    CategoryComponent,
    LucideAngularModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-grow',
  },
})
export class HomeComponent implements OnInit {
  protected readonly HomeViewState = HomeViewState;
  protected readonly showCategoryList = computed(() => {
    return true;
  });
  protected readonly icons = {
    Plus,
    SortAsc,
    SortDesc,
  };
  protected readonly viewService = inject(ViewService);
  protected readonly profileService = inject(ProfileService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly categories = signal<(Category & { img: string })[]>([]);
  protected readonly sort = signal<null | ProfileSort>(null);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly loadingProfiles = signal<boolean>(false);
  protected readonly profileItems = computed(() => {
    const allItems = this.profileService.displayProfiles();
    const selectedCategory = this.categoryService.selectedCategory();
    const sort = this.sort();
    const sortDirection = this.sortDirection() === 'asc' ? 1 : -1;
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
    } else {
      return filtered;
    }
  });
  private readonly navbarService = inject(NavbarService);

  constructor() {
    effect(
      () => {
        const selectedCategory = this.categoryService.selectedCategory();
        this.setNavActions(selectedCategory);
      },
      { allowSignalWrites: true }
    );
    effect(
      () => {
        const selectedProfile = this.profileService.selectedProfile();
        if (selectedProfile === undefined) {
          const selectedCategory = untracked(() =>
            this.categoryService.selectedCategory()
          );
          this.setNavActions(selectedCategory);
        }
      },
      { allowSignalWrites: true }
    );
    effect(
      async () => {
        const allCategories = [
          { id: 'all', name: 'All', icon: '' },
          ...this.categoryService.allCategories(),
        ];
        const categories: (Category & { img: string })[] = [];
        for (const c of allCategories) {
          const img = await this.categoryService.getCategoryIcon(c);
          categories.push({ ...c, img });
        }
        this.categories.set(categories);
      },
      { allowSignalWrites: true }
    );
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

  public ngOnInit() {
    this.handleSelectCategory({ id: 'all' } as Category);
  }

  protected newProfile() {
    const selectedCategory = this.categoryService.selectedCategory();
    const newCategories = selectedCategory ? [selectedCategory.id] : [];
    this.profileService.selectedProfile.set({
      id: '',
      base: '',
      engine: '',
      icon: '',
      name: '',
      files: [],
      categories: newCategories,
      cvars: [],
      parents: [],
      tags: [],
      created: new Date().toISOString(),
      lastPlayed: null,
      complete: false,
    });
    this.viewService.homeState.set(HomeViewState.ProfileEdit);
  }

  protected newCategory() {
    this.categoryService.selectedCategory.set({
      id: '',
      name: '',
      icon: '',
    });
    this.editCategory();
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
      this.selectProfile(profile);
    } else if (event.action === 'delete' && profile) {
      this.profileService.deleteProfile(profile);
    } else if (event.action === 'launch' && profile) {
      this.profileService.launch(profile);
    }
  }

  protected handleSelectCategory(category: Category) {
    if (category.id === 'all') {
      this.categoryService.selectedCategory.set(undefined);
    } else {
      this.categoryService.selectedCategory.set(category);
    }
    this.profileService.selectedProfile.set(undefined);
    this.viewService.homeState.set(HomeViewState.ProfileList);
  }

  private selectProfile(profile: Profile | undefined) {
    this.profileService.selectedProfile.set(profile);
    this.viewService.homeState.set(HomeViewState.ProfileEdit);
  }

  private editCategory() {
    const category = this.categoryService.selectedCategory();
    if (!category || category.id === 'all') {
      return;
    }
    this.categoryService.selectedCategory.set(category);
    this.profileService.selectedProfile.set(undefined);
    this.viewService.homeState.set(HomeViewState.CategoryEdit);
  }

  private setNavActions(selectedCategory: Category | undefined) {
    if (selectedCategory === undefined) {
      this.navbarService.setCallbacks({
        new: { cb: this.newProfile.bind(this), label: 'New Profile' },
      });
    } else {
      this.navbarService.setCallbacks({
        edit: { cb: this.editCategory.bind(this), label: 'Edit Category' },
        new: { cb: this.newProfile.bind(this), label: 'New Profile' },
      });
    }
  }
}
