import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Play, Trash, Wrench } from 'lucide-angular';
import { v4 as uuid } from 'uuid';
import { Api } from '../api/api';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import type {
  GridItem,
  GridItemEvent,
} from '../shared/components/item-grid/item-grid.component';
import { ItemGridComponent } from '../shared/components/item-grid/item-grid.component';
import { ProfileService } from '../profile/profile.service';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FileInputComponent,
    ItemGridComponent,
    ProfileComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly profileService = inject(ProfileService);
  protected readonly profileItems = signal<GridItem[]>([]);

  constructor() {
    effect(
      async () => {
        const allProfiles = this.profileService.allProfiles();
        const itemGridItems: GridItem[] = [];
        for (const profile of allProfiles) {
          const img = profile.icon
            ? await Api['fileSystem.getBase64Image'](profile.icon)
            : '';
          itemGridItems.push({
            ...profile,
            img,
            actions: [
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
            ],
          });
        }
        this.profileItems.set(itemGridItems);
      },
      { allowSignalWrites: true }
    );
  }

  protected newProfile() {
    this.profileService.selectedProfile.set({
      id: uuid(),
      base: '',
      engine: '',
      icon: '',
      name: '',
      files: [],
    });
  }

  protected handleAction(event: GridItemEvent) {
    const profile = this.profileService
      .allProfiles()
      .find((p) => p.name === event.item.name);
    if (event.action === 'primary' || event.action === 'edit') {
      this.profileService.selectedProfile.set(profile);
    } else if (event.action === 'delete' && profile) {
      this.profileService.deleteProfile(profile);
    } else if (event.action === 'launch' && profile) {
      this.profileService.launch(profile);
    }
  }
}
