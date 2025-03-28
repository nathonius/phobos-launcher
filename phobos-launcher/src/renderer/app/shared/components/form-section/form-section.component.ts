import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'form-section',
    imports: [],
    templateUrl: './form-section.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSectionComponent {
  public readonly label = input<string>();
}
