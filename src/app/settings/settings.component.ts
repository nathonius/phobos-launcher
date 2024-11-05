import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { ValidTheme } from '../shared/services/theme.service';
import { ThemeService } from '../shared/services/theme.service';
import { SteamGridService } from '../shared/services/steam-grid.service';
import { FormSectionComponent } from '../shared/components/form-section/form-section.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, FormSectionComponent],
  templateUrl: './settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  protected readonly themeService = inject(ThemeService);
  protected readonly steamGridService = inject(SteamGridService);
  protected readonly settingsForm = new FormGroup({
    theme: new FormControl<string | null>(null),
    steamGridApiKey: new FormControl<string | null>(null),
  });

  public constructor() {
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
}
