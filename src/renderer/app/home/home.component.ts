/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  SortAsc,
  SortDesc,
  Search,
} from 'lucide-angular';
import type { Category, Profile } from '../../../shared/config';
import { ProfileService } from '../profile/profile.service';
import { ProfileComponent } from '../profile/profile.component';
import { CategoryService } from '../category/category.service';
import { CategoryComponent } from '../category/category.component';
import { NavbarService } from '../shared/services/navbar.service';
import { HomeViewState } from '../shared/constants';
import { ViewService } from '../shared/services/view.service';
import type { ProfileItemEvent } from '../profile/profile-item/profile-item.interface';
import { ProfileListComponent } from '../profile/profile-list/profile-list.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    ReactiveFormsModule,
    ProfileComponent,
    CategoryComponent,
    LucideAngularModule,
    FormsModule,
    ProfileListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'grow',
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
    Search,
  };
  protected readonly searchQuery = linkedSignal<string>(() => {
    this.categoryService.selectedCategory();
    return '';
  });
  protected readonly viewService = inject(ViewService);
  protected readonly profileService = inject(ProfileService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly categories = signal<(Category & { img: string })[]>([]);
  protected readonly loadingProfiles = signal<boolean>(false);
  private readonly navbarService = inject(NavbarService);

  constructor() {
    effect(() => {
      const selectedCategory = this.categoryService.selectedCategory();
      this.setNavActions(selectedCategory);
    });
    effect(() => {
      const selectedProfile = this.profileService.selectedProfile();
      if (selectedProfile === undefined) {
        const selectedCategory = untracked(() =>
          this.categoryService.selectedCategory()
        );
        this.setNavActions(selectedCategory);
      }
    });
    effect(async () => {
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
      background: '',
      rating: null,
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
