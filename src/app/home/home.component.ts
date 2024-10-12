import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Play, Trash, Wrench } from 'lucide-angular';
import { Api } from '../api/api';
import { FileInputComponent } from '../shared/components/file-input/file-input.component';
import type { GridItemEvent } from '../shared/components/item-grid/item-grid.component';
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
  protected readonly profileItems = computed(() =>
    this.profileService.allProfiles().map((p) => {
      const actions = [
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
      ];
      return { ...p, img: this.fallbackImage, actions };
    })
  );

  private fallbackImage: string = '';

  constructor() {
    Api['fileSystem.getBase64Image']('default-item-bg.png').then((base64) => {
      this.fallbackImage = base64;
    });
  }

  protected handleAction(event: GridItemEvent) {
    const profile = this.profileService
      .allProfiles()
      .find((p) => p.name === event.item.name);
    if (event.action === 'primary') {
      this.profileService.selectedProfile.set(profile);
    } else if (event.action === 'delete' && profile) {
      this.profileService.deleteProfile(profile);
    } else if (event.action === 'launch' && profile) {
      this.profileService.launch(profile);
    }
  }
}
