import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
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
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import { ProfileService } from './profile.service';

@Component({
  selector: 'profile',
  standalone: true,
  imports: [ReactiveFormsModule, FileInputComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  public readonly profile = input<Profile>();
  protected readonly profileService = inject(ProfileService);
  protected readonly profileForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    engine: new FormControl<string>('', { nonNullable: true }),
    base: new FormControl<string>('', { nonNullable: true }),
    icon: new FormControl<string>('', { nonNullable: true }),
    files: new FormArray<FormControl<string>>([]),
  });
  protected profileIcon = signal<string>('');

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
          });
          for (const file of profile.files) {
            this.profileForm.controls.files.push(
              new FormControl<string>(file, { nonNullable: true })
            );
          }
        } else {
          this.profileForm.controls.files.clear();
          this.profileForm.reset({ name: '', base: '', engine: '', files: [] });
        }
      },
      { allowSignalWrites: true }
    );
  }

  protected async handleIconChange(iconPath: string) {
    const icon = await this.profileService.getProfileIcon(iconPath);
    this.profileIcon.set(icon);
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
    const { engine, base, files, name, icon } = this.profileForm.value;
    return {
      id: profileId,
      name: name!,
      engine: engine!,
      base: base!,
      files: files!,
      icon: icon!,
    };
  }
}
