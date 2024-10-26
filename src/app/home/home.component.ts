import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Play, Plus, Trash, Wrench } from 'lucide-angular';
import { v4 as uuid } from 'uuid';
import type { Category, Profile } from '@shared/config';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import type {
  GridItem,
  GridItemEvent,
} from '../shared/components/item-grid/item-grid.component';
import { ItemGridComponent } from '../shared/components/item-grid/item-grid.component';
import { ProfileService } from '../profile/profile.service';
import { ProfileComponent } from '../profile/profile.component';
import { CategoryService } from '../category/category.service';
import { CategoryComponent } from '../category/category.component';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { NavbarService } from '../shared/services/navbar.service';

enum HomeViewState {
  CategoryEdit,
  ProfileList,
  ProfileEdit,
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FileInputComponent,
    ItemGridComponent,
    ProfileComponent,
    CategoryComponent,
    LucideAngularModule,
    FormSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-grow',
  },
})
export class HomeComponent implements OnInit {
  protected readonly HomeViewState = HomeViewState;
  protected readonly viewState = signal<HomeViewState>(
    HomeViewState.ProfileList
  );
  protected readonly showCategoryList = computed(() => {
    return true;
  });
  protected readonly icons = {
    Plus,
  };
  protected readonly profileService = inject(ProfileService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly categories = signal<(Category & { img: string })[]>([]);
  protected readonly allProfileItems = signal<GridItem[]>([]);
  protected readonly profileItems = computed(() => {
    const allItems = this.allProfileItems();
    const selectedCategory = this.categoryService.selectedCategory();
    if (selectedCategory === undefined || selectedCategory.id === 'all') {
      return allItems;
    } else {
      return allItems.filter((p) =>
        ((p as unknown as Profile).categories ?? []).includes(
          selectedCategory.id
        )
      );
    }
  });
  private readonly navbarService = inject(NavbarService);

  constructor() {
    effect(
      async () => {
        const allCategories = this.categoryService.allCategories();
        const categories: (Category & { img: string })[] = [];
        for (const c of allCategories) {
          const img = await this.categoryService.getCategoryIcon(c);
          categories.push({ ...c, img });
        }
        categories.unshift({ id: 'all', name: 'All', icon: '', img: '' });
        this.categories.set(categories);
      },
      { allowSignalWrites: true }
    );
    effect(
      async () => {
        const allProfiles = this.profileService.allProfiles();
        const itemGridItems: GridItem[] = [];
        for (const profile of allProfiles) {
          const img = await this.profileService.getProfileIcon(profile);
          itemGridItems.push({
            ...profile,
            img,
            actions: [
              {
                name: 'edit',
                label: 'Edit',
                icon: Wrench,
              },
              {
                name: 'launch',
                label: 'Launch',
                icon: Play,
              },
              {
                name: 'delete',
                label: 'Delete',
                icon: Trash,
              },
            ],
          });
        }
        this.allProfileItems.set(itemGridItems);
      },
      { allowSignalWrites: true }
    );
  }

  public ngOnInit() {
    this.handleSelectCategory({ id: 'all' } as Category);
  }

  protected newProfile() {
    this.profileService.selectedProfile.set({
      id: uuid(),
      base: '',
      engine: '',
      icon: '',
      name: '',
      files: [],
      categories: [],
    });
    this.viewState.set(HomeViewState.ProfileEdit);
  }

  protected newCategory() {
    this.categoryService.selectedCategory.set({
      id: uuid(),
      name: '',
      icon: '',
    });
    this.editCategory();
  }

  protected handleAction(event: GridItemEvent) {
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
      this.navbarService.items.set([
        {
          label: 'New profile',
          icon: Plus,
          callback: this.newProfile.bind(this),
          style: 'secondary',
        },
      ]);
    } else {
      this.categoryService.selectedCategory.set(category);
      this.navbarService.items.set([
        {
          label: 'Edit category',
          icon: Wrench,
          callback: this.editCategory.bind(this),
          style: 'primary',
        },
        {
          label: 'New profile',
          icon: Plus,
          callback: this.newProfile.bind(this),
          style: 'secondary',
        },
      ]);
    }
    this.profileService.selectedProfile.set(undefined);
    this.viewState.set(HomeViewState.ProfileList);
  }

  private selectProfile(profile: Profile | undefined) {
    this.profileService.selectedProfile.set(profile);
    this.viewState.set(HomeViewState.ProfileEdit);
  }

  private editCategory() {
    const category = this.categoryService.selectedCategory();
    if (!category || category.id === 'all') {
      return;
    }
    this.categoryService.selectedCategory.set(category);
    this.profileService.selectedProfile.set(undefined);
    this.viewState.set(HomeViewState.CategoryEdit);
  }
}
