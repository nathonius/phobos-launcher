import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'form-section',
  standalone: true,
  imports: [],
  templateUrl: './form-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionComponent {
  public readonly label = input<string>();
}
