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
import { GamepadTesterComponent } from '../shared/components/gamepad-tester/gamepad-tester.component';
import { GamepadService } from '../shared/services/gamepad.service';

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
  protected readonly gamepadService = inject(GamepadService);
  protected readonly settingsForm = new FormGroup({
    theme: new FormControl<string | null>(null),
    steamGridApiKey: new FormControl<string | null>(null),
    deutexPath: new FormControl<string | null>(null),
    tempDataPath: new FormControl<string | null>(null),
    importPath: new FormControl<string>('', { nonNullable: true }),
    gamepadEnabled: new FormControl<boolean>(false, { nonNullable: true }),
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
      Api['settings.set']('defaultCvars', defaultCvars);
    });
    Api['settings.getAll']().then(
      ({
        defaultCvars,
        deutexPath,
        tempDataPath,
        gamepadEnabled,
        steamGridApiKey,
      }) => {
        this.settingsForm.controls.deutexPath.reset(deutexPath ?? null);
        this.settingsForm.controls.tempDataPath.reset(tempDataPath ?? null);
        this.settingsForm.controls.gamepadEnabled.reset(
          gamepadEnabled ?? false
        );
        this.settingsForm.controls.steamGridApiKey.reset(
          steamGridApiKey ?? null
        );
        this.defaultCvars.set(defaultCvars ?? []);
      }
    );
  }

  public ngOnInit(): void {
    this.settingsForm.controls.theme.valueChanges.subscribe((val) => {
      this.themeService.setTheme(val as AppTheme | null);
    });
    this.settingsForm.controls.steamGridApiKey.valueChanges.subscribe((val) => {
      this.steamGridService.setKey(val ? val : null);
    });
    this.settingsForm.controls.deutexPath.valueChanges.subscribe((val) => {
      Api['settings.set']('deutexPath', val ?? '');
    });
    this.settingsForm.controls.tempDataPath.valueChanges.subscribe((val) => {
      Api['settings.set']('tempDataPath', val ?? '');
    });
    this.settingsForm.controls.gamepadEnabled.valueChanges.subscribe((val) => {
      Api['settings.set']('gamepadEnabled', val);
      this.gamepadService.gamepadEnabled.set(val);
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
