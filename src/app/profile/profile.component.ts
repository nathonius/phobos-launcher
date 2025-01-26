import type { OnInit, ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import type { UniqueFileRecord, Cvar, Engine, Profile } from '@shared/config';

import { v4 as uuid } from 'uuid';
import type { SGDBGame, SGDBImage } from '@shared/lib/SGDB';
import { CdkListboxModule } from '@angular/cdk/listbox';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import { FileListComponent } from '../shared/components/file-list/file-list.component';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { NavbarService } from '../shared/services/navbar.service';
import { SelectListComponent } from '../shared/components/select-list/select-list.component';
import { CategoryService } from '../category/category.service';
import { KeyValueListComponent } from '../shared/components/key-value-list/key-value-list.component';
import { Api } from '../api/api';
import { AutocompleteComponent } from '../shared/components/autocomplete/autocomplete.component';
import { SteamGridService } from '../shared/services/steam-grid.service';
import { TagListComponent } from '../shared/components/tag-list/tag-list.component';
import { ViewService } from '../shared/services/view.service';
import { HomeViewState } from '../shared/constants';
import { ProfileService } from './profile.service';

type ProfileForm = FormGroup<{
  name: FormControl<string>;
  engine: FormControl<string>;
  base: FormControl<string>;
  icon: FormControl<string>;
  files: FormControl<string[]>;
  categories: FormControl<string[]>;
  cvars: FormControl<Cvar[]>;
  parents: FormControl<string[]>;
  tags: FormControl<string[]>;
  complete: FormControl<boolean>;
}>;

@Component({
  selector: 'profile',
  imports: [
    ReactiveFormsModule,
    FileInputComponent,
    FileListComponent,
    FormSectionComponent,
    SelectListComponent,
    KeyValueListComponent,
    AutocompleteComponent,
    CdkListboxModule,
    TagListComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block grow',
  },
})
export class ProfileComponent implements OnInit {
  public readonly profile = input<Profile>();
  public readonly deleteProfile = output();
  protected readonly profileService = inject(ProfileService);
  protected readonly navbarService = inject(NavbarService);
  protected readonly steamGridService = inject(SteamGridService);
  protected readonly viewService = inject(ViewService);
  protected readonly profileForm: ProfileForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    engine: new FormControl<string>('', { nonNullable: true }),
    base: new FormControl<string>('', { nonNullable: true }),
    icon: new FormControl<string>('', { nonNullable: true }),
    files: new FormControl<string[]>([], { nonNullable: true }),
    categories: new FormControl<string[]>([], { nonNullable: true }),
    cvars: new FormControl<Cvar[]>([], { nonNullable: true }),
    parents: new FormControl<string[]>([], { nonNullable: true }),
    tags: new FormControl<string[]>([], { nonNullable: true }),
    complete: new FormControl<boolean>(false, { nonNullable: true }),
  });
  protected readonly profileIcon = signal<string>('');
  protected readonly categoryOptions = computed(() =>
    this.categoryService
      .allCategories()
      .map((c) => ({ label: c.name, value: c.id }))
  );
  protected readonly engineOptions = signal<Engine[]>([]);
  protected readonly baseOptions = signal<UniqueFileRecord[]>([]);
  protected readonly sgdbLoading = signal<boolean>(false);
  protected readonly steamGridGames = signal<SGDBGame[]>([]);
  protected readonly selectedGame = signal<SGDBGame | null>(null);
  protected readonly steamGridGrids = signal<SGDBImage[]>([]);
  protected readonly sgdbDialog =
    viewChild<ElementRef<HTMLDialogElement>>('sgdbDialog');
  protected readonly allParentProfileOptions = signal<Profile[]>([]);
  protected readonly parentProfileOptions = computed(() =>
    this.allParentProfileOptions().map((p) => ({ value: p.id, label: p.name }))
  );
  private readonly categoryService = inject(CategoryService);
  private steamGridTimeout: number | undefined;

  constructor() {
    effect(
      async () => {
        const currentProfile = this.profile();
        const engines = await Api['engine.getEngines']();
        const bases = await Api['settings.get']('bases');
        const profiles = (await Api['profile.getProfiles']()).filter(
          (p) => p.id !== currentProfile?.id
        );
        this.engineOptions.set(engines);
        this.baseOptions.set((bases ?? []) as UniqueFileRecord[]);
        this.allParentProfileOptions.set(profiles);
      },
      { allowSignalWrites: true }
    );
    effect(
      () => {
        const profile = this.profile();
        if (profile) {
          this.profileForm.reset({
            name: profile.name,
            base: profile.base,
            engine: profile.engine,
            icon: profile.icon,
            files: profile.files,
            categories: profile.categories,
            cvars: profile.cvars,
            parents: profile.parents,
            tags: profile.tags,
            complete: profile.complete,
          });
        } else {
          this.profileForm.reset({
            name: '',
            base: '',
            engine: '',
            files: [],
            categories: [],
            cvars: [],
            parents: [],
            tags: [],
            complete: false,
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  public ngOnInit(): void {
    this.navbarService.setCallbacks({
      delete: { cb: this.handleDelete.bind(this), label: 'Delete Profile' },
      save: { cb: this.handleSave.bind(this), label: 'Save' },
      launch: { cb: this.handleLaunch.bind(this), label: 'Launch' },
    });
  }

  protected handleIconChange(iconPath: string) {
    const icon = this.profileService.getProfileIcon(iconPath);
    this.profileIcon.set(icon);
  }

  protected handleFormControlChange<K extends keyof ProfileForm['controls']>(
    value: ProfileForm['controls'][K]['value'],
    control: keyof ProfileForm['controls']
  ): void {
    (
      this.profileForm.controls[control] as FormControl<
        string | boolean | string[] | Cvar[]
      >
    ).setValue(value);
  }

  protected handleSave() {
    const profile = this.getProfile();
    void this.profileService.save(profile);
  }

  protected async handleDelete() {
    const profile = this.profile();
    if (profile?.id) {
      await this.profileService.deleteProfile(profile);
    }
    this.viewService.homeState.set(HomeViewState.ProfileList);
    this.profileService.selectedProfile.set(undefined);
  }

  protected handleLaunch() {
    const profile = this.getProfile();
    void this.profileService.launch(profile);
  }

  protected handleDrop(event: DragEvent) {
    // TODO: Figure this out???
    const target = event.target as HTMLInputElement;
  }

  protected openSgdbDialog() {
    this.sgdbDialog()?.nativeElement.showModal();
  }

  protected steamGridGameQuery(val: string) {
    this.sgdbLoading.set(true);
    window.clearTimeout(this.steamGridTimeout);
    if (!val || val.length < 3) {
      this.steamGridGames.set([]);
      return;
    }
    window.setTimeout(async () => {
      const games = await Api['sgdb.queryGames'](val);
      this.steamGridGames.set(games);
      this.sgdbLoading.set(false);
    }, 500);
  }

  protected async steamGridSelectGame(game: SGDBGame | null) {
    if (!game) {
      return;
    }
    this.selectedGame.set(game);
    this.sgdbLoading.set(true);
    const grids = await Api['sgdb.getImages'](game, ['grid', 'icon', 'logo']);
    this.steamGridGrids.set(grids);
    this.sgdbLoading.set(false);
  }
  protected async steamGridSelectGrid(grid: SGDBImage | null) {
    if (!grid) {
      return;
    }
    const path = await Api['sgdb.downloadImage'](grid);
    this.profileForm.controls.icon.setValue(path);
    this.selectedGame.set(null);
    this.sgdbDialog()?.nativeElement.close();
  }

  private getProfile(): Profile {
    // TODO: Validate profile
    const originalProfile = this.profile();
    let profileId = originalProfile?.id;
    if (!profileId) {
      profileId = uuid();
    }
    const {
      engine,
      base,
      files,
      name,
      icon,
      categories,
      cvars,
      parents,
      tags,
      complete,
    } = this.profileForm.value;
    return {
      id: profileId,
      name: name!,
      engine: engine!,
      base: base!,
      files: files!,
      icon: icon!,
      categories: categories!,
      cvars: cvars!,
      parents: parents!,
      tags: tags!,
      created: originalProfile?.created ?? new Date().toISOString(),
      lastPlayed: originalProfile?.lastPlayed ?? null,
      complete: complete!,
    };
  }
}
