import type { OutputEmitterRef } from '@angular/core';
import {
  booleanAttribute,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AXES,
  BUTTON,
  GamepadService,
  type AXES_NAME,
  type BUTTON_NAME,
} from '../services/gamepad.service';
import { distance, relativeAngle } from '../functions/angles';
import { GamepadSelectableDirective } from './gamepad-selectable.directive';

type GamepadDirective = {
  [key in BUTTON_NAME | AXES_NAME]: OutputEmitterRef<void>;
};

const DEADZONE_TOLERANCE = 0.8;
const ANGLE_TOLERANCE = 25;
const DEBOUNCE_MS = 200;

@Directive({ selector: '[gamepad]' })
export class GamepadListenerDirective implements GamepadDirective {
  public LeftX = output();
  public LeftY = output();
  public RightX = output();
  public RightY = output();
  public A = output();
  public B = output();
  public X = output();
  public Y = output();
  public L1 = output();
  public L2 = output();
  public R1 = output();
  public R2 = output();
  public L3 = output();
  public R3 = output();
  public Select = output();
  public Start = output();
  public DPadUp = output();
  public DPadDown = output();
  public DPadLeft = output();
  public DPadRight = output();
  public Platform = output();

  public global = input(false, { transform: booleanAttribute });

  protected readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  protected readonly gamepadService = inject(GamepadService);
  protected readonly selectables = contentChildren(GamepadSelectableDirective, {
    read: GamepadSelectableDirective,
    descendants: true,
  });
  protected readonly debounce = signal(false);
  protected debounceTimeout: number = 0;

  constructor() {
    for (const button of Object.keys(BUTTON)) {
      effect(this.gamepadButtonEffect(button as BUTTON_NAME));
    }
    for (const axis of Object.keys(AXES)) {
      effect(this.gamepadAxisEffect(axis as AXES_NAME));
    }
    effect(() => {
      const leftX = this.gamepadService.axes.LeftX();
      const leftY = this.gamepadService.axes.LeftY();
      if (
        Math.abs(leftX) > DEADZONE_TOLERANCE ||
        Math.abs(leftY) > DEADZONE_TOLERANCE
      ) {
        console.log(`${leftX},${leftY}`);
        console.log(this.selectables());
        this.handleAnalogInput({ x: leftX, y: leftY });
      }
    });

    effect(() => {
      const debounce = this.debounce();
      if (debounce) {
        window.clearTimeout(this.debounceTimeout);
        this.debounceTimeout = window.setTimeout(() => {
          this.debounce.set(false);
        }, DEBOUNCE_MS);
      }
    });
  }

  private handleAnalogInput(inputEvent: { x: number; y: number }) {
    const debounce = this.debounce();
    if (debounce) {
      return;
    }

    const selectables = this.selectables();
    const selected = selectables.find((s) => s.selected());
    if (!selected) {
      selectables[0]?.select();
      return;
    }
    const inputAngle = relativeAngle({ x: 0, y: 0 }, inputEvent);
    const origin = selected.getPosition();
    const angles = [];

    // Find angles and distances to all other points
    for (const selectable of selectables) {
      if (selectable !== selected) {
        const other = selectable.getPosition();
        angles.push({
          selectable,
          angle: relativeAngle(origin, other),
          distance: distance(origin, other),
        });
      }
    }

    // Filter to points within the angle tolerance
    const minAngle = (inputAngle - ANGLE_TOLERANCE) % 360;
    const maxAngle = (inputAngle + ANGLE_TOLERANCE) % 360;
    const possibleAngles = angles.filter(({ angle }) => {
      if (maxAngle < minAngle) {
        return angle >= maxAngle && angle <= minAngle;
      }
      return angle >= minAngle && angle <= maxAngle;
    });

    // Sort by distance
    const sortedPoints = possibleAngles.toSorted(
      (a, b) => a.distance - b.distance
    );

    // Select the closest selectable
    if (sortedPoints[0]) {
      sortedPoints[0].selectable.select();
      this.debounce.set(true);
    }
  }

  private gamepadButtonEffect(key: BUTTON_NAME): () => void {
    return () => {
      const gamepadConnected = this.gamepadService.gamepadConnected();
      const value = this.gamepadService.buttons[key]();
      const hostHasFocus = this.hostHasFocus();
      if (gamepadConnected && hostHasFocus && value) {
        this[key].emit();
      }
    };
  }

  private gamepadAxisEffect(key: AXES_NAME): () => void {
    return () => {
      const gamepadConnected = this.gamepadService.gamepadConnected();
      const value = this.gamepadService.axes[key]();
      const hostHasFocus = this.hostHasFocus();
      if (gamepadConnected && hostHasFocus && value > 0) {
        this[key].emit();
      }
    };
  }

  private hostHasFocus(): boolean {
    return (
      this.global() || this.host.nativeElement.contains(document.activeElement)
    );
  }
}
