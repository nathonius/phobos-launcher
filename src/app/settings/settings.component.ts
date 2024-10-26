import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { ValidTheme } from '../shared/services/theme.service';
import { ThemeService } from '../shared/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  protected readonly themeService = inject(ThemeService);
  protected readonly settingsForm = new FormGroup({
    theme: new FormControl<string | null>(null),
  });

  public ngOnInit(): void {
    this.settingsForm.controls.theme.setValue(this.themeService.theme());
    this.settingsForm.controls.theme.valueChanges.subscribe((val) => {
      this.themeService.setTheme(val as ValidTheme | null);
    });
  }
}
