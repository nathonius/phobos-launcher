import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'profile-section',
  standalone: true,
  imports: [],
  templateUrl: './profile-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSectionComponent {
  public readonly label = input<string>();
}
