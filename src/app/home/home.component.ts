import { Component, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import type { Profile } from '@shared/config';
import { Api } from '../api/api';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FileInputComponent],
})
export class HomeComponent {
  protected readonly form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    engine: new FormControl<string>('', { nonNullable: true }),
    base: new FormControl<string>('', { nonNullable: true }),
    files: new FormArray<FormControl<string>>([]),
  });
  protected readonly profiles = signal<Profile[]>([]);

  constructor() {
    effect(
      async () => {
        this.profiles.set(await Api['profile.getProfiles']());
      },
      { allowSignalWrites: true }
    );
  }

  protected selectProfile(event: Event) {
    const name = (event.target as HTMLSelectElement).value;
    const profile = this.profiles().find((p) => p.name === name);
    if (profile) {
      this.form.setValue({ ...profile });
    }
  }

  protected async save() {
    await Api['profile.save'](this.getProfile());
    this.profiles.set(await Api['profile.getProfiles']());
  }

  protected launch() {
    void Api['profile.launchCustom'](this.getProfile());
  }

  addFile() {
    this.form.controls.files.push(
      new FormControl<string>('', { nonNullable: true })
    );
  }

  handleDrop(event: DragEvent) {
    // TODO: Figure this out???
    const target = event.target as HTMLInputElement;
    console.log(target.files);
  }

  private getProfile(): Profile {
    const { engine, base, files, name } = this.form.value;
    return {
      name: name!,
      engine: engine!,
      base: base!,
      files: files!,
    };
  }
}
