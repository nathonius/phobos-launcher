import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { ValidTheme } from '../shared/services/theme.service';
import { ThemeService, THEME_MAP } from '../shared/services/theme.service';
import { SteamGridService } from '../shared/services/steam-grid.service';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import { Api } from '../api/api';
import { CategoryService } from '../category/category.service';
import { ProfileService } from '../profile/profile.service';
import { NavbarService } from '../shared/services/navbar.service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, FormSectionComponent, FileInputComponent],
  templateUrl: './settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  protected readonly themeOptions = Object.entries(THEME_MAP);
  protected readonly themeService = inject(ThemeService);
  protected readonly steamGridService = inject(SteamGridService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly profileService = inject(ProfileService);
  protected readonly settingsForm = new FormGroup({
    theme: new FormControl<string | null>(null),
    steamGridApiKey: new FormControl<string | null>(null),
    importPath: new FormControl<string>('', { nonNullable: true }),
  });
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
  }

  public ngOnInit(): void {
    this.settingsForm.controls.theme.valueChanges.subscribe((val) => {
      this.themeService.setTheme(val as ValidTheme | null);
    });
    this.settingsForm.controls.steamGridApiKey.valueChanges.subscribe((val) => {
      this.steamGridService.setKey(val ? val : null);
    });
  }

  public async startImport() {
    const path = this.settingsForm.controls.importPath.value;
    await Api['import.arachnotron'](path);
    await this.categoryService.getAllCategories();
    await this.profileService.getAllProfiles();
  }
}
