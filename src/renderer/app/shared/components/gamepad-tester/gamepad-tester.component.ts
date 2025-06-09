import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GamepadService } from '../../services/gamepad.service';

@Component({
  selector: 'gamepad-tester',
  imports: [],
  templateUrl: './gamepad-tester.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamepadTesterComponent {
  protected readonly gamepadService = inject(GamepadService);
}
