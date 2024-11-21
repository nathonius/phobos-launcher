import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { Category } from '@shared/config';
import { v4 as uuid } from 'uuid';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import { NavbarService } from '../shared/services/navbar.service';
import { ViewService } from '../shared/services/view.service';
import { HomeViewState } from '../shared/constants';
import { CategoryService } from './category.service';

@Component({
  selector: 'category',
  standalone: true,
  imports: [ReactiveFormsModule, FormSectionComponent, FileInputComponent],
  templateUrl: './category.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent implements OnInit {
  public readonly category = input<Category | null>();
  protected readonly categoryForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    icon: new FormControl<string>('', { nonNullable: true }),
  });
  protected readonly categoryIcon = signal<string>('');
  private readonly categoryService = inject(CategoryService);
  private readonly navbarService = inject(NavbarService);
  private readonly viewService = inject(ViewService);

  constructor() {
    effect(
      () => {
        const category = this.category();
        if (category) {
          this.categoryForm.reset({
            name: category.name,
            icon: category.icon,
          });
        } else {
          this.categoryForm.reset({ name: '', icon: '' });
        }
      },
      { allowSignalWrites: true }
    );
    this.categoryForm.controls.icon.valueChanges.subscribe((v) => {
      this.handleIconChange(v);
    });
  }

  public ngOnInit(): void {
    this.navbarService.setCallbacks({
      delete: {
        cb: this.handleDelete.bind(this),
        label: 'Delete Category',
      },
      save: { cb: this.handleSave.bind(this), label: 'Save' },
    });
  }

  protected async handleIconChange(iconPath: string) {
    const icon = await this.categoryService.getCategoryIcon(iconPath);
    this.categoryIcon.set(icon);
  }

  protected async handleSave() {
    const category = this.getCategory();
    await this.categoryService.save(category);
  }

  protected async handleDelete() {
    const category = this.category();
    if (category?.id) {
      await this.categoryService.deleteCategory(category);
    }
    this.viewService.homeState.set(HomeViewState.ProfileList);
    this.categoryService.selectedCategory.set(undefined);
  }

  private getCategory(): Category {
    // TODO: Validate category
    let categoryId = this.category()?.id;
    if (categoryId === undefined) {
      categoryId = uuid();
    }
    const { name, icon } = this.categoryForm.value;
    return {
      id: categoryId,
      name: name!,
      icon: icon!,
    };
  }
}
