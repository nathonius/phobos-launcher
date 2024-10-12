import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import type { Profile } from '@shared/config';
import { Play, Trash, Wrench } from 'lucide-angular';
import { Api } from '../api/api';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import type { GridItemEvent } from '../shared/components/item-grid/item-grid.component';
import { ItemGridComponent } from '../shared/components/item-grid/item-grid.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FileInputComponent,
    ItemGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    engine: new FormControl<string>('', { nonNullable: true }),
    base: new FormControl<string>('', { nonNullable: true }),
    files: new FormArray<FormControl<string>>([]),
  });
  protected readonly profiles = signal<Profile[]>([]);
  protected readonly profileItems = computed(() =>
    this.profiles().map((p) => {
      const actions = [
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
      ];
      return { ...p, img: this.fallbackImage, actions };
    })
  );

  private fallbackImage: string = '';

  constructor() {
    effect(
      async () => {
        this.fallbackImage = await Api['fileSystem.getBase64Image'](
          'default-item-bg.png'
        );
        this.profiles.set(await Api['profile.getProfiles']());
      },
      { allowSignalWrites: true }
    );
  }

  protected handleAction(event: GridItemEvent) {
    const profile = this.profiles().find((p) => p.name === event.item.name);
    if (event.action === 'primary') {
      this.selectProfile(profile ?? null);
    } else if (event.action === 'delete' && profile) {
      void this.deleteProfile(profile);
    } else if (event.action === 'launch' && profile) {
      this.launch(profile);
    }
  }

  protected selectProfile(profile: Profile | null) {
    this.form.controls.files.clear();
    if (profile) {
      for (const _file of profile.files) {
        this.form.controls.files.push(
          new FormControl<string>('', { nonNullable: true })
        );
      }
      this.form.setValue(profile);
    } else {
      this.form.reset();
    }
  }

  protected async save() {
    await Api['profile.save'](this.getProfile());
    this.profiles.set(await Api['profile.getProfiles']());
  }

  protected async deleteProfile(profile: Profile) {
    await Api['profile.delete'](profile);
    this.profiles.set(await Api['profile.getProfiles']());
  }

  protected launch(profile = this.getProfile()) {
    void Api['profile.launchCustom'](profile);
  }

  protected async saveImage(input: HTMLInputElement) {
    const file = input.files![0];
    const fileData = await file.arrayBuffer();
    await fetch(`phobos-data://${file.name}`, {
      method: 'POST',
      body: fileData,
    });
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
