import { Component, inject, signal } from '@angular/core';
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

enum AppViewState {
  Home,
  Settings,
  Engines,
  Bases,
}

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
    class: 'flex flex-col h-full w-full',
  },
})
export class AppComponent {
  protected readonly AppViewState = AppViewState;
  protected readonly viewState = signal<AppViewState>(AppViewState.Home);
  protected readonly navbarService = inject(NavbarService);
  protected readonly themeService = inject(ThemeService);
  protected readonly icons = {
    Settings,
    Cog,
    Package,
    Home,
  };
}
