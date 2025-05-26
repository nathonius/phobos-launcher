import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Check, LucideAngularModule, AlertTriangle } from 'lucide-angular';
import { NgClass } from '@angular/common';
import { ThemeService, THEME_MAP } from '../shared/services/theme.service';
import { SteamGridService } from '../shared/services/steam-grid.service';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import { Api } from '../api/api';
import { CategoryService } from '../category/category.service';
import { ProfileService } from '../profile/profile.service';
import { NavbarService } from '../shared/services/navbar.service';
import { KeyValueListComponent } from '../shared/components/key-value-list/key-value-list.component';
import type { AppTheme, Cvar } from '../../../shared/config';
import type { JSONValue } from '../../../shared/json';
import { GamepadTesterComponent } from '../shared/components/gamepad-tester/gamepad-tester.component';

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
  ],
  templateUrl: './settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  protected readonly icons = {
    Check,
    AlertTriangle,
  };
  protected readonly themeOptions = Object.entries(THEME_MAP);
  protected readonly themeService = inject(ThemeService);
  protected readonly steamGridService = inject(SteamGridService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly profileService = inject(ProfileService);
  protected readonly settingsForm = new FormGroup({
    theme: new FormControl<string | null>(null),
    steamGridApiKey: new FormControl<string | null>(null),
    deutexPath: new FormControl<string | null>(null),
    tempDataPath: new FormControl<string | null>(null),
    importPath: new FormControl<string>('', { nonNullable: true }),
  });
  protected readonly defaultCvars = signal<Cvar[]>([]);
  protected readonly clearDataStatus = signal<
    'CLEARING' | 'CLEARED' | 'ERROR' | null
  >(null);
  private readonly navbarService = inject(NavbarService);

  public constructor() {
    this.navbarService.setCallbacks({});
    effect(() => {
      const key = this.steamGridService.apiKey();
      this.settingsForm.controls.steamGridApiKey.reset(key);
    });
    effect(() => {
      const theme = this.themeService.theme();
      this.settingsForm.controls.theme.reset(theme);
    });
    effect(() => {
      const defaultCvars = this.defaultCvars();
      Api['settings.set']('defaultCvars', defaultCvars as unknown as JSONValue);
    });
    Api['settings.get']('defaultCvars').then((cvars: Cvar[] | null) => {
      this.defaultCvars.set(cvars ?? []);
    });
    Api['settings.get']('deutexPath').then((path: string | null) => {
      this.settingsForm.controls.deutexPath.setValue(path ?? null);
    });
    Api['settings.get']('tempDataPath').then((path: string | null) => {
      this.settingsForm.controls.tempDataPath.setValue(path);
    });
  }

  public ngOnInit(): void {
    this.settingsForm.controls.theme.valueChanges.subscribe((val) => {
      this.themeService.setTheme(val as AppTheme | null);
    });
    this.settingsForm.controls.steamGridApiKey.valueChanges.subscribe((val) => {
      this.steamGridService.setKey(val ? val : null);
    });
    this.settingsForm.controls.deutexPath.valueChanges.subscribe((val) => {
      Api['settings.set']('deutexPath', val);
    });
    this.settingsForm.controls.tempDataPath.valueChanges.subscribe((val) => {
      Api['settings.set']('tempDataPath', val);
    });
  }

  public async startImport() {
    const path = this.settingsForm.controls.importPath.value;
    await Api['import.arachnotron'](path);
    await this.categoryService.getAllCategories();
    await this.profileService.getAllProfiles();
  }

  public handleCvarChange(values: Cvar[]): void {
    this.defaultCvars.set(values);
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
