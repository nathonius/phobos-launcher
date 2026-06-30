import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  LucideArrowDown,
  LucideArrowUp,
  LucideFile,
  LucideFolder,
  LucideGlobe,
  LucideTrash,
} from '@lucide/angular';

@Component({
  selector: 'file-input-controls',
  imports: [
    LucideArrowDown,
    LucideArrowUp,
    LucideFile,
    LucideFolder,
    LucideGlobe,
    LucideTrash,
  ],
  templateUrl: './file-input-controls.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileInputControlsComponent {
  public readonly directory = input(true, { transform: booleanAttribute });
  public readonly file = input(true, { transform: booleanAttribute });
  public readonly web = input(false, { transform: booleanAttribute });
  public readonly removable = input(false, { transform: booleanAttribute });
  public readonly reorder = input(false, { transform: booleanAttribute });

  public readonly remove = output();
  public readonly selectFile = output();
  public readonly selectDirectory = output();
  public readonly reorderDown = output();
  public readonly reorderUp = output();
  public readonly webClick = output();
}
