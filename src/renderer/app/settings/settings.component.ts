import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, Field } from '@angular/forms/signals';
import { Check, LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { NgClass } from '@angular/common';
import {
  ThemeService,
  THEME_MAP,
  DEFAULT_THEME,
} from '../shared/services/theme.service';
import { SteamGridService } from '../shared/services/steam-grid.service';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import { Api } from '../api/api';
import { CategoryService } from '../category/category.service';
import { ProfileService } from '../profile/profile.service';
import { NavbarService } from '../shared/services/navbar.service';
import { KeyValueListComponent } from '../shared/components/key-value-list/key-value-list.component';
import type { AppTheme, Cvar } from '../../../shared/config';
import { GamepadTesterComponent } from '../shared/components/gamepad-tester/gamepad-tester.component';
import { GamepadService } from '../shared/services/gamepad.service';
import { FileListComponent } from '../shared/components/file-list/file-list.component';

interface SettingsData {
  theme: AppTheme;
  steamGridApiKey: string;
  deutexPath: string;
  tempDataPath: string;
  importPath: string;
  gamepadEnabled: boolean;
  defaultCvars: Cvar[];
  dataDirs: string[];
  useDataDirs: boolean;
}

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    FormSectionComponent,
    FileInputComponent,
    KeyValueListComponent,
    LucideAngularModule,
    NgClass,
    GamepadTesterComponent,
    Field,
    FileListComponent,
  ],
  templateUrl: './settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  protected readonly icons = {
    Check,
    TriangleAlert,
  };
  protected readonly themeOptions = Object.entries(THEME_MAP);
  protected readonly themeService = inject(ThemeService);
  protected readonly steamGridService = inject(SteamGridService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly profileService = inject(ProfileService);
  protected readonly gamepadService = inject(GamepadService);
  protected loading = true;
  protected readonly settingsModel = signal<SettingsData>({
    theme: DEFAULT_THEME,
    deutexPath: '',
    gamepadEnabled: false,
    importPath: '',
    steamGridApiKey: '',
    tempDataPath: '',
    defaultCvars: [],
    dataDirs: [],
    useDataDirs: true,
  });
  protected readonly settingsForm = form(this.settingsModel);
  protected readonly clearDataStatus = signal<
    'CLEARING' | 'CLEARED' | 'ERROR' | null
  >(null);
  private readonly navbarService = inject(NavbarService);

  public constructor() {
    this.navbarService.setCallbacks({});
    Api['settings.getAll']().then((settings) => {
      this.settingsModel.set({
        deutexPath: settings.deutexPath ?? '',
        gamepadEnabled: settings.gamepadEnabled ?? false,
        importPath: '',
        steamGridApiKey: settings.steamGridApiKey ?? '',
        tempDataPath: settings.tempDataPath ?? '',
        theme: settings.theme ?? DEFAULT_THEME,
        defaultCvars: settings.defaultCvars ?? [],
        dataDirs: settings.dataDirs ?? [],
        useDataDirs: settings.useDataDirs ?? true,
      });
      this.loading = false;
    });
    effect(() => {
      const formValue = this.settingsForm().value();
      if (!this.loading) {
        Api['settings.patch']({
          deutexPath: formValue.deutexPath,
          gamepadEnabled: formValue.gamepadEnabled,
          steamGridApiKey: formValue.steamGridApiKey,
          tempDataPath: formValue.tempDataPath,
          theme: formValue.theme,
          defaultCvars: formValue.defaultCvars,
          dataDirs: formValue.dataDirs,
          useDataDirs: formValue.useDataDirs,
        });
      }
    });
    effect(() => {
      const theme = this.settingsForm.theme().value();
      this.themeService.setTheme(theme);
    });
  }

  public openConfig() {
    Api['settings.openConfig']();
  }

  public async startImport() {
    const path = this.settingsForm.importPath().value();
    await Api['import.arachnotron'](path);
    await this.categoryService.getAllCategories();
    await this.profileService.getAllProfiles();
  }

  public async migrateAllPaths() {
    if (this.loading === false) {
      this.loading = true;
      await Api['profile.updateAllProfilesPaths']();
      await this.profileService.getAllProfiles();
      this.loading = false;
    }
  }

  public async absolutizeAllPaths() {
    if (this.loading === false) {
      this.loading = true;
      await Api['profile.absolutizeAllProfilesPaths']();
      await this.profileService.getAllProfiles();
      this.loading = false;
    }
  }

  public handleCvarChange(values: Cvar[]): void {
    this.settingsForm.defaultCvars().value.set(values);
  }

  public handleDataDirsChange(values: string[]): void {
    this.settingsForm.dataDirs().value.set(values);
  }

  public async handleClearDataDir(): Promise<void> {
    this.clearDataStatus.set('CLEARING');
    const result = await Api['wad.clearDataDir']();
    if (result) {
      this.clearDataStatus.set('CLEARED');
      window.setTimeout(() => {
        try {
          this.clearDataStatus.set(null);
        } catch (err) {
          // pass
        }
      }, 4000);
    } else {
      this.clearDataStatus.set('ERROR');
    }
  }
}
