import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GlyphComponent } from '../shared/components/glyph/glyph.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GlyphComponent],
})
export class AppComponent {}
