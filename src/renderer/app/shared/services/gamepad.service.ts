import type { WritableSignal } from '@angular/core';
import {
  computed,
  effect,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';

export const BUTTON = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  Select: 8,
  Start: 9,
  L3: 10,
  R3: 11,
  DPadUp: 12,
  DPadDown: 13,
  DPadLeft: 14,
  DPadRight: 15,
  Platform: 16,
} as const;

export const AXES = {
  LeftX: 0,
  LeftY: 1,
  RightX: 2,
  RightY: 3,
} as const;

@Injectable({
  providedIn: 'root',
})
export class GamepadService {
  public readonly gamepadConnected = computed<boolean>(
    () => this.gamepad() !== null
  );
  public readonly buttons = this.buttonSignals();
  public readonly axes = this.axesSignals();
  private readonly gamepad = signal<string | null>(null);
  private readonly gamepads = signal<Gamepad[]>([]);
  private loopFlag: boolean = false;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const gamepads = navigator
      .getGamepads()
      .filter((gp) => gp !== null) as Gamepad[];
    if (gamepads.length > 0) {
      this.gamepads.set(gamepads);
      this.gamepad.set(gamepads[gamepads.length - 1].id);
    }

    window.addEventListener('gamepadconnected', (event) => {
      console.debug(`Gamepad ${event.gamepad.id} connected.`);
      this.gamepad.set(event.gamepad.id);
      this.gamepads.update((g) => {
        if (!g.find((pad) => pad.id === event.gamepad.id)) {
          g.push(event.gamepad);
        }
        return g;
      });
      console.log(event.gamepad);
    });

    window.addEventListener('gamepaddisconnected', (event) => {
      console.debug(`Gamepad ${event.gamepad.id} disconnected.`);
      this.gamepads.update((g) => {
        const index = g.findIndex((g) => g.id === event.gamepad.id);
        if (index !== -1) {
          g.splice(index, 1);
        }
        return g;
      });
      const gamepads = this.gamepads();
      if (gamepads.length > 0) {
        this.gamepad.set(gamepads[gamepads.length - 1].id);
      } else {
        this.gamepad.set(null);
      }
    });

    // Start / stop the gamepad loop
    effect(() => {
      const gamepad = this.gamepad();
      const gamepadConnected = this.gamepadConnected();
      if (gamepadConnected !== this.loopFlag) {
        this.loopFlag = gamepadConnected;
        if (gamepadConnected) {
          console.debug(`Starting gamepad loop for ${gamepad}`);
          window.requestAnimationFrame(() => this.gamepadLoop(gamepad));
        } else {
          console.debug(`Ending gamepad loop for ${gamepad}`);
        }
      }
    });
  }

  private gamepadLoop(gp: string | null) {
    if (!gp || this.loopFlag === false) {
      this.loopFlag = false;
      return;
    }
    const gamepad = navigator.getGamepads().find((g) => g?.id === gp);
    if (!gamepad) {
      this.loopFlag = false;
      return;
    }
    // Do checking
    for (const [b, signal] of Object.entries(this.buttons)) {
      const button = gamepad.buttons[BUTTON[b as keyof typeof BUTTON]];
      signal.set(button.value > 0 || button.pressed);
    }
    for (const [a, signal] of Object.entries(this.axes)) {
      const axis = gamepad.axes[AXES[a as keyof typeof AXES]];
      signal.set(axis);
    }
    // Next cycle
    window.requestAnimationFrame(() => this.gamepadLoop(this.gamepad()));
  }

  private buttonSignals(): Record<
    keyof typeof BUTTON,
    WritableSignal<boolean>
  > {
    const buttons: Record<
      keyof typeof BUTTON,
      WritableSignal<boolean>
    > = Object.entries(BUTTON).reduce<
      Record<keyof typeof BUTTON, WritableSignal<boolean>>
    >((acc, cur) => {
      const [k, v] = cur;
      acc[k as keyof typeof BUTTON] = this.buttonSignal(v);
      return acc;
    }, {} as Record<keyof typeof BUTTON, WritableSignal<boolean>>);
    return buttons;
  }

  private buttonSignal(button: number): WritableSignal<boolean> {
    return linkedSignal<boolean>(() => {
      const gp = this.gamepad();
      const gamepad = navigator.getGamepads().find((g) => g?.id === gp);
      if (gamepad) {
        return (
          gamepad.buttons[button].value > 0 || gamepad.buttons[button].pressed
        );
      }
      return false;
    });
  }

  private axesSignals(): Record<keyof typeof AXES, WritableSignal<number>> {
    const axes: Record<
      keyof typeof AXES,
      WritableSignal<number>
    > = Object.entries(BUTTON).reduce<
      Record<keyof typeof AXES, WritableSignal<number>>
    >((acc, cur) => {
      const [k, v] = cur;
      acc[k as keyof typeof AXES] = this.axisSignal(v);
      return acc;
    }, {} as Record<keyof typeof AXES, WritableSignal<number>>);
    return axes;
  }

  private axisSignal(axis: number): WritableSignal<number> {
    return linkedSignal<number>(() => {
      const gp = this.gamepad();
      const gamepad = navigator.getGamepads().find((g) => g?.id === gp);
      if (gamepad) {
        return gamepad.axes[axis];
      }
      return 0;
    });
  }
}
