import { Component, inject } from '@angular/core';
import {
  Cog,
  Home,
  LucideAngularModule,
  Package,
  Settings,
} from 'lucide-angular';
import { NgClass } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { NavbarService } from './shared/services/navbar.service';
import { SettingsComponent } from './settings/settings.component';
import { EnginesComponent } from './engines/engines.component';
import { BasesComponent } from './bases/bases.component';
import { ThemeService } from './shared/services/theme.service';
import { AppViewState } from './shared/constants';
import { ViewService } from './shared/services/view.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    HomeComponent,
    SettingsComponent,
    EnginesComponent,
    BasesComponent,
    LucideAngularModule,
    NgClass,
  ],
  standalone: true,
  host: {
    class: 'flex flex-col h-screen w-screen overflow-hidden',
  },
})
export class AppComponent {
  protected readonly AppViewState = AppViewState;
  protected readonly navbarService = inject(NavbarService);
  protected readonly themeService = inject(ThemeService);
  protected readonly viewService = inject(ViewService);
  protected readonly icons = {
    Settings,
    Cog,
    Package,
    Home,
  };
}
