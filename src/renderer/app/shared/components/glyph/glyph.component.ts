import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type ButtonGlyph =
  | 'A'
  | 'AOutline'
  | 'B'
  | 'BOutline'
  | 'X'
  | 'XOutline'
  | 'Y'
  | 'YOutline'
  | 'L1'
  | 'L1Outline'
  | 'L2'
  | 'L2Outline'
  | 'R1'
  | 'R1Outline'
  | 'R2'
  | 'R2Outline'
  | 'Start'
  | 'StartOutline'
  | 'Select'
  | 'SelectOutline'
  | 'DAll'
  | 'DNone'
  | 'DUp'
  | 'DDown'
  | 'DLeft'
  | 'DRight'
  | 'DUpDown'
  | 'DLeftRight';

@Component({
  selector: 'glyph',
  templateUrl: './glyph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlyphComponent {
  public readonly button = input.required<ButtonGlyph>();
}
