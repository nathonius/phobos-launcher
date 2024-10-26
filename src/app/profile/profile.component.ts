import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import type { Profile } from '@shared/config';
import { v4 as uuid } from 'uuid';
import { Rocket, Save, Trash } from 'lucide-angular';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import { FileListComponent } from '../shared/components/file-list/file-list.component';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { NavbarService } from '../shared/services/navbar.service';
import { SelectListComponent } from '../shared/components/select-list/select-list.component';
import { CategoryService } from '../category/category.service';
import { ProfileService } from './profile.service';

@Component({
  selector: 'profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FileInputComponent,
    FileListComponent,
    FormSectionComponent,
    SelectListComponent,
  ],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  public readonly profile = input<Profile>();
  public readonly deleteProfile = output();
  protected readonly profileService = inject(ProfileService);
  protected readonly navbarService = inject(NavbarService);
  protected readonly profileForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    engine: new FormControl<string>('', { nonNullable: true }),
    base: new FormControl<string>('', { nonNullable: true }),
    icon: new FormControl<string>('', { nonNullable: true }),
    files: new FormArray<FormControl<string>>([]),
    categories: new FormControl<string[]>([], { nonNullable: true }),
  });
  protected readonly profileIcon = signal<string>('');
  protected readonly categoryOptions = computed(() =>
    this.categoryService
      .allCategories()
      .map((c) => ({ label: c.name, value: c.id }))
  );
  private readonly categoryService = inject(CategoryService);

  constructor() {
    effect(
      () => {
        const profile = this.profile();
        if (profile) {
          this.profileForm.controls.files.clear();
          this.profileForm.reset({
            name: profile.name,
            base: profile.base,
            engine: profile.engine,
            icon: profile.icon,
            files: [],
            categories: profile.categories,
          });
          for (const file of profile.files) {
            this.profileForm.controls.files.push(
              new FormControl<string>(file, { nonNullable: true })
            );
          }
        } else {
          this.profileForm.controls.files.clear();
          this.profileForm.reset({
            name: '',
            base: '',
            engine: '',
            files: [],
            categories: [],
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  public ngOnInit(): void {
    this.navbarService.items.set([
      {
        label: 'Delete',
        icon: Trash,
        callback: () => {
          this.deleteProfile.emit();
        },
      },
      {
        icon: Save,
        label: 'Save',
        callback: this.handleSave.bind(this),
        style: 'primary',
      },
      {
        icon: Rocket,
        label: 'Launch',
        callback: this.handleLaunch.bind(this),
        style: 'secondary',
      },
    ]);
  }

  protected async handleIconChange(iconPath: string) {
    const icon = await this.profileService.getProfileIcon(iconPath);
    this.profileIcon.set(icon);
  }

  protected handleCategoriesChange(values: string[]) {
    this.profileForm.controls.categories.setValue(values);
  }

  protected handleSave() {
    const profile = this.getProfile();
    void this.profileService.save(profile);
  }

  protected handleLaunch() {
    const profile = this.getProfile();
    void this.profileService.launch(profile);
  }

  addFile() {
    this.profileForm.controls.files.push(
      new FormControl<string>('', { nonNullable: true })
    );
  }

  handleDrop(event: DragEvent) {
    // TODO: Figure this out???
    const target = event.target as HTMLInputElement;
    console.log(target.files);
  }

  private getProfile(): Profile {
    // TODO: Validate profile
    const profileId = this.profile()?.id ?? uuid();
    const { engine, base, files, name, icon, categories } =
      this.profileForm.value;
    return {
      id: profileId,
      name: name!,
      engine: engine!,
      base: base!,
      files: files!,
      icon: icon!,
      categories: categories!,
    };
  }
}
