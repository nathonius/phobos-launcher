import { Directive, ElementRef, inject, DOCUMENT } from '@angular/core';
import { elementInViewport } from '../functions/inViewport';
import { relativeAngle, relativeDeltaAngle } from '../functions/angles';

@Directive({ selector: '[padSelectable]' })
export class GamepadSelectableDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly DOCUMENT = inject(DOCUMENT);

  public isVisible() {
    return elementInViewport(this.elementRef.nativeElement);
  }

  public getPosition() {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const x = rect.left + (rect.right - rect.left) / 2;
    const y = rect.top + (rect.bottom - rect.top) / 2;
    return { x, y };
  }

  public getRelativeAngle(other: { x: number; y: number }) {
    const thisPos = this.getPosition();
    return relativeAngle(thisPos, other);
  }

  public getGamepadInputAngle(input: { x: number; y: number }) {
    const thisPos = this.getPosition();
    return relativeDeltaAngle(thisPos, input);
  }

  public select() {
    this.elementRef.nativeElement.focus();
  }

  public selected() {
    return this.DOCUMENT.activeElement === this.elementRef.nativeElement;
  }

  public activate() {
    this.elementRef.nativeElement.click();
  }
}
