import type { OutputEmitterRef } from '@angular/core';
import {
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import {
  AXES,
  BUTTON,
  GamepadService,
  type AXES_NAME,
  type BUTTON_NAME,
} from '../services/gamepad.service';

type GamepadDirective = {
  [key in BUTTON_NAME | AXES_NAME]: OutputEmitterRef<void>;
};

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

  constructor() {
    for (const button of Object.keys(BUTTON)) {
      effect(this.gamepadButtonEffect(button as BUTTON_NAME));
    }
    for (const axis of Object.keys(AXES)) {
      effect(this.gamepadAxisEffect(axis as AXES_NAME));
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
