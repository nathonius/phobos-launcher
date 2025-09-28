import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { GamepadService } from '../../services/gamepad.service';
import { GamepadSelectableDirective } from '../../directives/gamepad-selectable.directive';
import { GamepadListenerDirective } from '../../directives/gamepad-listener.directive';

@Component({
  selector: 'gamepad-tester',
  imports: [GamepadSelectableDirective, GamepadListenerDirective],
  templateUrl: './gamepad-tester.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamepadTesterComponent {
  protected readonly gamepadService = inject(GamepadService);
}
