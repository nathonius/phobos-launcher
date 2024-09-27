import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-wad-list',
  standalone: true,
  imports: [],
  templateUrl: './wad-list.component.html',
  styleUrl: './wad-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WadListComponent {
  protected readonly category = input<string>('abc');
}
