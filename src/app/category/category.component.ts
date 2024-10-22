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
import { CategoryService } from './category.service';

@Component({
  selector: 'category',
  standalone: true,
  imports: [ReactiveFormsModule, FormSectionComponent, FileInputComponent],
  templateUrl: './category.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
  public readonly category = input<Category | null>();
  protected readonly categoryForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    icon: new FormControl<string>('', { nonNullable: true }),
  });
  protected readonly categoryIcon = signal<string>('');
  private readonly categoryService = inject(CategoryService);

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
  }

  protected async handleIconChange(iconPath: string) {
    const icon = await this.categoryService.getCategoryIcon(iconPath);
    this.categoryIcon.set(icon);
  }

  protected handleSave() {
    const category = this.getCategory();
    void this.categoryService.save(category);
  }

  private getCategory(): Category {
    // TODO: Validate category
    const categoryId = this.category()?.id ?? uuid();
    const { name, icon } = this.categoryForm.value;
    return {
      id: categoryId,
      name: name!,
      icon: icon!,
    };
  }
}
